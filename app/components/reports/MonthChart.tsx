import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G, Path } from 'react-native-svg';

export interface Bar {
  key: string;
  name: string;
  color: string;
}

interface Props {
  months: Record<string, any>[];
  bars: Bar[];
  currency: string;
  hideLegend?: boolean;
}

// Same compact formatter the web chart uses for axis ticks.
const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${+(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
};

/** Nice round maximum so the y-axis ticks read well (1, 2, 2.5, 5, 10 × 10ⁿ). */
const niceMax = (max: number) => {
  if (max <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
};

const roundedTop = (x: number, y: number, w: number, h: number, r: number) => {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
};

/** Bar chart matching the web Reports chart: grid, y-axis, rounded bars, tap for values. */
const MonthChart: React.FC<Props> = ({ months, bars, currency, hideLegend }) => {
  const [boxW, setBoxW] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  if (months.length === 0) {
    return <Text className="text-center text-slate-400 py-6">No data for this period.</Text>;
  }

  const H = 220;
  const TOP = 12;
  const BOTTOM = 26;
  const Y_AXIS = 42;
  const plotH = H - TOP - BOTTOM;
  const BAR_GAP = 3;
  // Narrowest a month slot may get; wider screens spread the months to fill the width.
  const MIN_SLOT = bars.length * 17 + 10;
  const BAR_W = 14;

  const max = niceMax(Math.max(...months.flatMap((m) => bars.map((b) => Number(m[b.key]) || 0))));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const available = boxW - Y_AXIS;
  const slot = Math.max(available / months.length, MIN_SLOT);
  const contentW = slot * months.length;
  const y = (v: number) => TOP + plotH - (v / max) * plotH;

  const sel = selected !== null ? months[selected] : null;

  return (
    <View onLayout={(e) => setBoxW(e.nativeEvent.layout.width)}>
      {boxW > 0 && (
        <View className="flex-row">
          {/* Fixed y-axis */}
          <Svg width={Y_AXIS} height={H}>
            {ticks.map((t) => (
              <SvgText key={t} x={Y_AXIS - 4} y={y(t) + 4} fontSize={9} fill="#94A3B8" textAnchor="end">
                {`${currency} ${compact(t)}`.trim()}
              </SvgText>
            ))}
          </Svg>

          {/* Scrollable plot */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Svg width={contentW} height={H}>
              {ticks.map((t) => (
                <Line key={t} x1={0} x2={contentW} y1={y(t)} y2={y(t)} stroke="#F1F5F9" strokeWidth={1} strokeDasharray="3 3" />
              ))}
              {months.map((m, i) => {
                const slotX = i * (contentW / months.length);
                const slotW = contentW / months.length;
                const groupW = bars.length * BAR_W + (bars.length - 1) * BAR_GAP;
                const startX = slotX + (slotW - groupW) / 2;
                return (
                  <G key={m.month ?? i}>
                    {selected === i && <Rect x={slotX + 2} y={TOP} width={slotW - 4} height={plotH} fill="#F8FAFC" />}
                    {bars.map((b, bi) => {
                      const v = Number(m[b.key]) || 0;
                      const h = (v / max) * plotH;
                      return h > 0 ? (
                        <Path key={b.key} d={roundedTop(startX + bi * (BAR_W + BAR_GAP), y(v), BAR_W, h, 4)} fill={b.color} />
                      ) : null;
                    })}
                    <SvgText x={slotX + slotW / 2} y={H - 8} fontSize={11} fill="#94A3B8" textAnchor="middle">
                      {String(m.month)}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
            {/* Transparent tap targets over each month */}
            <View className="absolute left-0 top-0 flex-row" style={{ width: contentW, height: H }}>
              {months.map((m, i) => (
                <Pressable
                  key={m.month ?? i}
                  style={{ width: contentW / months.length, height: H }}
                  onPress={() => setSelected(selected === i ? null : i)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Tooltip (web shows this on hover) */}
      {sel && (
        <View className="mt-2 bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm self-start">
          <Text className="text-xs font-semibold text-slate-700 mb-1">{String(sel.month)}</Text>
          {bars.map((b) => (
            <View key={b.key} className="flex-row items-center">
              <View className="w-2 h-2 rounded-sm mr-1.5" style={{ backgroundColor: b.color }} />
              <Text className="text-xs text-slate-500">
                {b.name}:{' '}
                <Text className="text-slate-800 font-semibold">
                  {currency} {Number(sel[b.key] || 0).toLocaleString()}
                </Text>
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Legend */}
      {!hideLegend && (
      <View className="flex-row justify-center mt-3">
        {bars.map((b) => (
          <View key={b.key} className="flex-row items-center mx-2">
            <View className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: b.color }} />
            <Text className="text-xs text-slate-500">{b.name}</Text>
          </View>
        ))}
      </View>
      )}
    </View>
  );
};

export default MonthChart;
