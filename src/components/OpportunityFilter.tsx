/* eslint-disable import/no-anonymous-default-export */
import * as React from 'react';
import {
    FilterList,
    FilterLiveSearch,
    FilterListItem,
} from 'react-admin';
import { Box } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
const sizes = [
    { id: 'very-small', name: 'Very Small (1-10)' },
    { id: 'small', name: 'Small (11-50)' },
    { id: 'medium', name: 'Medium (51-200)' },
    { id: 'large', name: 'Large (201-500)' },
    { id: 'enterprise', name: 'Enterprise (501-1000)' },
    { id: 'large-enterprise', name: 'Large Enterprise (1000+)' },
]

export const OpportunityFilter = (props) => {
    const { stages } = props;
    return (
        <Box width="13em" minWidth="13em" order={-1} mr={2} mt={5}>
            <FilterLiveSearch label="Position" source="position_title@ilike" />
            <FilterLiveSearch label="Company" source="company_name@ilike" />
            <FilterList label="Location" icon={<LocationOnIcon />}>
                <FilterLiveSearch label="Location" source="location@ilike" />
                <FilterListItem
                    label="Remote"
                    value={{ "is_remote@is": 'true' }}
                />
                <FilterListItem
                    label="Onsite"
                    value={{ "is_remote@is": 'false' }}
                />
            </FilterList>

            <FilterList label="Company Size" icon={<BusinessIcon />}>
                {sizes.map(size => (
                    <FilterListItem
                        key={size.id}
                        label={size.name}
                        value={{ company_size: size.id }}
                    />
                ))}
            </FilterList>

            <FilterList label="Work Arrangement" icon={<WorkHistoryIcon />}>
                <FilterListItem
                    label="Full Time"
                    value={{ work_arrangement: 'full-time' }}
                />
                <FilterListItem
                    label="Part Time"
                    value={{ work_arrangement: 'part-time' }}
                />
                <FilterListItem
                    label="Permanent"
                    value={{ employment_type: 'permanent' }}
                />
                <FilterListItem
                    label="Contract"
                    value={{ employment_type: 'contract' }}
                />
                <FilterListItem
                    label="Internship"
                    value={{ employment_type: 'internship' }}
                />
                <FilterListItem
                    label="Temporary"
                    value={{ employment_type: 'temporary' }}
                />
            </FilterList>

            <FilterList label="Application Status" icon={<BusinessIcon />}>
                <FilterListItem
                    label="In Progress"
                    value={{ 'close_reason@is': 'null' }}
                />
                <FilterListItem
                    label="Accepted"
                    value={{ close_reason: 'accepted' }}
                />
                <FilterListItem
                    label="Declined"
                    value={{ close_reason: 'declined' }}
                />
                <FilterListItem
                    label="Withdrawn"
                    value={{ close_reason: 'withdrawn' }}
                />
                <FilterListItem
                    label="Other"
                    value={{ close_reason: 'other' }}
                />
            </FilterList>
            <FilterList label="Stage" icon={<ChecklistRtlIcon />}>
                {stages.map(stage => (
                    <FilterListItem
                        key={stage.id}
                        label={stage.stage_name}
                        value={{ "stage_ids@cs": stage.id }}
                    />
                ))}
            </FilterList>
        </Box>
    );
};
