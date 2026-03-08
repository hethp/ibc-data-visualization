import { Select } from 'antd';
import { useSemesters, useProjects } from '../../hooks/useDashboardData';
import { useSearchParams } from 'react-router-dom';

const { Option } = Select;

export function FilterBar() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentSemester = searchParams.get('semester') || '';
    // accept `projects` or legacy `project`
    const rawProjects = searchParams.get('projects') || searchParams.get('project'); // comma-separated project IDs

    const { data: semesters, isLoading: loadingSemesters } = useSemesters();
    const { data: projects, isLoading: loadingProjects } = useProjects(currentSemester);

    const selectedProjectIds = rawProjects
        ? [...new Set(rawProjects.split(',').filter(Boolean))]
        : [];

    const handleSemesterChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('semester', value);
        newParams.delete('projects'); // reset projects when semester changes
        setSearchParams(newParams);
    };

    const handleProjectsChange = (values: string[]) => {
        const newParams = new URLSearchParams(searchParams);

        // If user clicked "All Projects", clear filter → shows everything
        if (values.includes('__all')) {
            newParams.delete('projects');
            newParams.delete('project');
            setSearchParams(newParams);
            return;
        }

        if (values.length > 0) {
            newParams.set('projects', values.join(','));
            newParams.delete('project');
        } else {
            // No projects selected → show ALL data for semester
            newParams.delete('projects');
            newParams.delete('project');
        }
        setSearchParams(newParams);
    };

    // For display: when nothing is filtered, show "All Projects" as a visual hint
    // When specific projects are selected, show those
    const displayValue = selectedProjectIds.length > 0 ? selectedProjectIds : [];

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
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Projects
                    {selectedProjectIds.length === 0 && currentSemester && (
                        <span className="text-indigo-400 ml-1">(All)</span>
                    )}
                </label>
                <Select
                    mode="multiple"
                    className="w-80"
                    placeholder="All Projects"
                    allowClear
                    loading={loadingProjects}
                    value={displayValue}
                    onChange={handleProjectsChange}
                    disabled={!currentSemester}
                    maxTagCount={2}
                    maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
                    popupClassName="bg-gray-800 text-white"
                >
                    <Option key="__all" value="__all" className="font-semibold">
                        ✓ All Projects
                    </Option>
                    {projects?.map((proj) => (
                        <Option key={proj.id} value={proj.id}>{proj.name}</Option>
                    ))}
                </Select>
            </div>
        </div>
    );
}

