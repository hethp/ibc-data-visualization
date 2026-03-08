import { Card, Divider, Switch, Typography } from 'antd';
import { useTheme } from '../context/ThemeContext';

export function Settings() {
    const { mode, toggle } = useTheme();
    const isDark = mode === 'dark';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Typography.Title level={2} className="text-white">
                        Settings
                    </Typography.Title>
                    <Typography.Paragraph className="text-gray-300 max-w-2xl">
                        Adjust your application preferences. Your theme choice is saved locally.
                    </Typography.Paragraph>
                </div>
            </div>

            <Card className={isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}>
                <Typography.Title level={4} className={isDark ? 'text-white' : 'text-gray-900'}>
                    Theme
                </Typography.Title>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <Typography.Text className={isDark ? 'text-gray-200' : 'text-gray-600'}>
                            Toggle between light and dark mode.
                        </Typography.Text>
                    </div>
                    <Switch
                        checked={isDark}
                        onChange={toggle}
                        checkedChildren="Dark"
                        unCheckedChildren="Light"
                    />
                </div>
            </Card>
        </div>
    );
}
