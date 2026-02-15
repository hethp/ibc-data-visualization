import { Select } from 'antd';
import { useSemesters, useProjects } from '../../hooks/useDashboardData';
import { useSearchParams } from 'react-router-dom';

const { Option } = Select;

export function FilterBar() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentSemester = searchParams.get('semester') || '';
    const currentProject = searchParams.get('project'); // optional

    const { data: semesters, isLoading: loadingSemesters } = useSemesters();
    const { data: projects, isLoading: loadingProjects } = useProjects(currentSemester);

    const handleSemesterChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('semester', value);
        newParams.delete('project'); // reset project when semester changes
        setSearchParams(newParams);
    };

    const handleProjectChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('project', value);
        } else {
            newParams.delete('project');
        }
        setSearchParams(newParams);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Semester</label>
                <Select
                    className="w-48"
                    placeholder="Select Semester"
                    loading={loadingSemesters}
                    value={currentSemester || undefined}
                    onChange={handleSemesterChange}
                    popupClassName="bg-gray-800 text-white"
                >
                    {semesters?.map((sem) => (
                        <Option key={sem.id} value={sem.id}>{sem.name}</Option>
                    ))}
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Project (Optional)</label>
                <Select
                    className="w-64"
                    placeholder="All Projects"
                    allowClear
                    loading={loadingProjects}
                    value={currentProject || undefined}
                    onChange={handleProjectChange}
                    disabled={!currentSemester}
                >
                    {projects?.map((proj) => (
                        <Option key={proj.id} value={proj.id}>{proj.name}</Option>
                    ))}
                </Select>
            </div>

            {/* Add Role filter here later */}
        </div>
    );
}
