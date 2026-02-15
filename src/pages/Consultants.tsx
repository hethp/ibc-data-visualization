import { useQuery } from '@tanstack/react-query';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockApi } from '../services/mockApi';
import type { Consultant } from '../types';
import '../styles/antd-overrides.css'; // Importing overrides

export function Consultants() {
    const { data: consultants, isLoading } = useQuery({
        queryKey: ['consultants'],
        queryFn: mockApi.getConsultants,
    });

    const columns: ColumnsType<Consultant> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-medium text-white">{text}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Current Role',
            dataIndex: 'currentRole',
            key: 'currentRole',
            render: (role) => (
                <Tag color={role === 'PL' ? 'purple' : role === 'Sr' ? 'blue' : 'default'}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Consultants Directory</h1>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={consultants}
                    rowKey="email"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
}
