package com.invoicesmarty

import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream

/**
 * Saves a file into Download/<folder> through Android's MediaStore, so no folder
 * picker or storage permission is needed on Android 10 and newer.
 * Used from JavaScript as NativeModules.InvoiceFiles.saveToDownloads(...).
 */
class InvoiceFilesModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "InvoiceFiles"

  /** sourceUri: file:// URI or absolute path of the file to copy. Resolves with the saved file's URI. */
  @ReactMethod
  fun saveToDownloads(sourceUri: String, fileName: String, folder: String, mimeType: String, promise: Promise) {
    // File copying must not block the JS or UI thread.
    Thread {
      try {
        promise.resolve(save(sourceUri, fileName, folder, mimeType))
      } catch (e: Exception) {
        promise.reject("ERR_SAVE", e.message ?: "Could not save the file", e)
      }
    }.start()
  }

  private fun save(sourceUri: String, fileName: String, folder: String, mimeType: String): String {
    val source = File(Uri.parse(sourceUri).path ?: sourceUri)
    if (!source.exists()) throw IllegalStateException("Source file does not exist")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val resolver = reactContext.contentResolver
      val values = ContentValues().apply {
        put(MediaStore.Downloads.DISPLAY_NAME, fileName)
        put(MediaStore.Downloads.MIME_TYPE, mimeType)
        put(MediaStore.Downloads.RELATIVE_PATH, "${Environment.DIRECTORY_DOWNLOADS}/$folder")
        put(MediaStore.Downloads.IS_PENDING, 1)
      }
      val target = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
        ?: throw IllegalStateException("Could not create the file in Downloads")
      try {
        val out = resolver.openOutputStream(target) ?: throw IllegalStateException("Could not open the output file")
        out.use { stream -> FileInputStream(source).use { input -> input.copyTo(stream) } }
        values.clear()
        values.put(MediaStore.Downloads.IS_PENDING, 0)
        resolver.update(target, values, null, null)
      } catch (e: Exception) {
        resolver.delete(target, null, null)
        throw e
      }
      return target.toString()
    }

    // Android 9 and older: write straight into the public Download folder.
    val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), folder)
    if (!dir.exists() && !dir.mkdirs()) throw IllegalStateException("Could not create the $folder folder")
    var target = File(dir, fileName)
    var counter = 1
    while (target.exists()) {
      val dot = fileName.lastIndexOf('.')
      val base = if (dot > 0) fileName.substring(0, dot) else fileName
      val ext = if (dot > 0) fileName.substring(dot) else ""
      target = File(dir, "$base ($counter)$ext")
      counter++
    }
    source.copyTo(target)
    return Uri.fromFile(target).toString()
  }
}
