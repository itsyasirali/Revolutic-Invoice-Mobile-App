package expo.modules.invoicefiles

import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream

/**
 * Saves a file into Download/<folder> through Android's MediaStore, so no
 * folder picker or storage permission is needed on Android 10 and newer.
 */
class InvoiceFilesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("InvoiceFiles")

    // sourceUri: file:// or absolute path of the file to copy.
    AsyncFunction("saveToDownloads") { sourceUri: String, fileName: String, folder: String, mimeType: String ->
      val context = appContext.reactContext
        ?: throw CodedException("ERR_NO_CONTEXT", "React context is not available", null)
      val source = File(Uri.parse(sourceUri).path ?: sourceUri)
      if (!source.exists()) {
        throw CodedException("ERR_SOURCE_MISSING", "Source file does not exist", null)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
          put(MediaStore.Downloads.DISPLAY_NAME, fileName)
          put(MediaStore.Downloads.MIME_TYPE, mimeType)
          put(MediaStore.Downloads.RELATIVE_PATH, "${Environment.DIRECTORY_DOWNLOADS}/$folder")
          put(MediaStore.Downloads.IS_PENDING, 1)
        }
        val target = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
          ?: throw CodedException("ERR_INSERT", "Could not create the file in Downloads", null)
        try {
          resolver.openOutputStream(target)?.use { out ->
            FileInputStream(source).use { input -> input.copyTo(out) }
          } ?: throw CodedException("ERR_STREAM", "Could not open the output file", null)
          values.clear()
          values.put(MediaStore.Downloads.IS_PENDING, 0)
          resolver.update(target, values, null, null)
        } catch (e: Exception) {
          resolver.delete(target, null, null)
          throw e
        }
        target.toString()
      } else {
        // Android 9 and older: write straight into the public Download folder.
        val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), folder)
        if (!dir.exists() && !dir.mkdirs()) {
          throw CodedException("ERR_MKDIR", "Could not create the $folder folder", null)
        }
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
        Uri.fromFile(target).toString()
      }
    }
  }
}
