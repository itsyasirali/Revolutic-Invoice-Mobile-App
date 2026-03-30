import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile } from '@/hooks/auth/useProfile';

const Greeting: React.FC = () => {
    const { user } = useProfile();
    const userName = user?.name || 'User';

    return (
        <View className="mb-5">

            {/* Welcome Message */}
            <View className="flex-row items-center mb-1.5">
                <MaterialIcons name="auto-awesome" size={22} color="#FF9608" style={{ marginRight: 8 }} />
                <View>
                    <Text className="text-xl font-bold text-slate-800">
                        Welcome {userName}
                    </Text>
                    <Text className="text-sm text-slate-500">
                        Here's your organization's overview
                    </Text>
                </View>
            </View>

        </View>
    );
};

export default Greeting;
