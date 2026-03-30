import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import StandardModal from '@/app/components/ui/StandardModal';
import { MaterialIcons } from '@expo/vector-icons';
import { useReceivables, FilterType } from '@/hooks/invoices/useReceivables';
import { BarChart } from 'react-native-gifted-charts';

const formatCurrency = (value: number) => {
    return 'PKR ' + Math.round(value).toLocaleString('en-US');
};

const formatCompactNumber = (number: number) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 0
    }).format(number);
};

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Quarter', value: 'this_quarter' },
    { label: 'Last Quarter', value: 'last_quarter' },
    { label: 'This Fiscal Year', value: 'this_fiscal_year' },
    { label: 'Last Fiscal Year', value: 'last_fiscal_year' },
    { label: 'Last 12 Months', value: 'last_12_months' },
];

const roundUpToNiceNumber = (num: number): number => {
    if (num === 0) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(num)));
    const normalized = num / magnitude;
    let niceNormalized;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 5) niceNormalized = 5;
    else niceNormalized = 10;
    return niceNormalized * magnitude;
};

const screenWidth = Dimensions.get('window').width;

const ReceivablesWidget: React.FC = () => {
    const { graphData, totalReceipts, totalReceivables, isLoading, filter, setFilter } = useReceivables();
    const [showFilter, setShowFilter] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ label: string, remaining: number, receipts: number } | null>(null);

    // Reset selection when filter changes
    React.useEffect(() => {
        setSelectedItem(null);
    }, [filter, graphData]);

    // Prepare data for Bar Chart
    const barData: any[] = [];
    (graphData || []).forEach(item => {
        barData.push({
            value: item.receipts,
            label: item.label,
            frontColor: '#10b981',

            onPress: () => setSelectedItem(item)
        });
    });

    const currentFilterLabel = FILTER_OPTIONS.find(f => f.value === filter)?.label || 'Last 12 Months';

    // Determine what to show in summary
    const displayReceivables = selectedItem ? selectedItem.remaining : (totalReceivables || 0);
    const displayReceipts = selectedItem ? selectedItem.receipts : (totalReceipts || 0);
    const displayTotal = displayReceivables + displayReceipts;

    // Calculate chart scaling
    const maxValueInGraph = barData.length > 0 ? Math.max(...barData.map(d => d.value)) : 0;
    const niceMaxValue = roundUpToNiceNumber(maxValueInGraph) * 1.2;
    const noOfSections = 4;

    const chartRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (filter === 'this_fiscal_year' || filter === 'this_quarter') {
            setTimeout(() => {
                chartRef.current?.scrollTo({ x: 0, y: 0, animated: true });
            }, 100);
        } else {
            setTimeout(() => {
                chartRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [graphData, filter]);

    // Calculate dynamic dimensions to fit exactly 6 items
    const yAxisLabelWidth = 45;
    const chartWidth = screenWidth - 80 - yAxisLabelWidth;
    const visibleItems = 6;
    const itemWidth = chartWidth / visibleItems;
    const dynamicBarWidth = itemWidth * 0.4;
    const dynamicSpacing = itemWidth * 0.65;

    return (
        <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm elevation-2 border border-slate-100">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-2">
                    <MaterialIcons name="donut-large" size={20} color="#0891B2" />
                    <Text className="text-lg font-bold text-primary">Receivables</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setShowFilter(true)}
                    className="flex-row items-center px-3 py-1.5"
                >
                    <Text className="text-base font-medium text-slate-600">{currentFilterLabel}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            <View className='flex-1 items-start mb-5'>
                <Text className="text-xs font-medium text-slate-500 uppercase">Total Receivables</Text>
                <Text className="text-lg font-bold text-slate-800 mb-0.5" numberOfLines={1} adjustsFontSizeToFit>
                    {isLoading ? '...' : formatCurrency(displayTotal)}
                </Text>

            </View>

            {/* Filter Modal */}
            <StandardModal
                visible={showFilter}
                onClose={() => setShowFilter(false)}
                height="auto"
            >
                <View className="py-2">
                    {FILTER_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`px-4 py-3 border-b border-slate-50 ${filter === option.value ? 'bg-slate-50' : ''}`}
                            onPress={() => {
                                setFilter(option.value);
                                setShowFilter(false);
                            }}
                        >
                            <Text className={`text-md ${filter === option.value ? 'font-bold text-primary' : 'text-slate-600'}`}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </StandardModal>

            {/* Chart */}
            <View className="items-center mb-6">
                {barData.length > 0 ? (
                    <BarChart
                        scrollRef={chartRef}
                        data={barData}
                        barWidth={dynamicBarWidth}
                        spacing={dynamicSpacing}
                        barBorderTopLeftRadius={5}
                        barBorderTopRightRadius={5}
                        barBorderBottomLeftRadius={5}
                        barBorderBottomRightRadius={5}
                        rulesType="solid"
                        rulesColor="#e2e8f0" // gray-200
                        yAxisOffset={0}
                        xAxisThickness={1}
                        xAxisColor="#cbd5e1"
                        renderTooltip={(item: any, index: number) => {
                            return (
                                <View style={{
                                    marginBottom: 10,
                                    marginLeft: -10,
                                    backgroundColor: '#f1f5f9',
                                    paddingHorizontal: 8,
                                    paddingVertical: 6,
                                    borderRadius: 6,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', marginBottom: 2 }}>
                                        {formatCompactNumber(item.value)}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: '#64748b', textAlign: 'center' }}>
                                        {item.label}
                                    </Text>
                                </View>
                            );
                        }}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }} // slate-400
                        yAxisLabelWidth={yAxisLabelWidth}
                        formatYLabel={(label) => formatCompactNumber(parseFloat(label))}
                        noOfSections={noOfSections}
                        maxValue={niceMaxValue}
                        height={220}
                        width={chartWidth}
                        isAnimated
                        initialSpacing={10}
                        endSpacing={20}
                    />
                ) : ( // ...
                    <View className="h-[200px] justify-center items-center">
                        <Text className="text-slate-400">No data for selected period</Text>
                    </View>
                )}
            </View>

            {/* Bottom Summary */}
            <View className="flex-row justify-between pt-4 border-t border-slate-100">
                <View>
                    <Text className="text-xs font-medium text-sky-500 uppercase">Remaining {selectedItem ? `(${selectedItem.label})` : ''}</Text>
                    <Text className="text-lg font-bold text-slate-800 mb-0.5" numberOfLines={1} adjustsFontSizeToFit>
                        {isLoading ? '...' : formatCurrency(displayReceivables)}
                    </Text>

                </View>
                <View className=''>
                    <Text className="text-xs font-medium text-emerald-500 uppercase">Received {selectedItem ? `(${selectedItem.label})` : ''}</Text>
                    <Text className="text-lg font-bold text-slate-800 mb-0.5" numberOfLines={1} adjustsFontSizeToFit>
                        {isLoading ? '...' : formatCurrency(displayReceipts)}
                    </Text>
                </View>
            </View>
        </View >
    );
};

export default ReceivablesWidget;
