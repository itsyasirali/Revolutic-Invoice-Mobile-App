import React from 'react';
import { ScrollView } from 'react-native';
import Greeting from './Greeting';
import QuickActions from './QuickActions';
import ReceivablesWidget from './ReceivablesWidget';
import RecentTransactions from './RecentTransactions';

const Dashboard = () => {
    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
            <Greeting />
            <QuickActions />
            <ReceivablesWidget />
            <RecentTransactions />
        </ScrollView>
    );
};

export default Dashboard;
