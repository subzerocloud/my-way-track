import {
    BooleanField, DatagridConfigurable, List, NumberField, TextField, TopToolbar,
    CreateButton, ExportButton, FunctionField,
    useGetList, Loading, DateField
} from 'react-admin';
import React, { useState, useEffect } from 'react';
import { LinearProgress, Rating } from '@mui/material';
import {OpportunityFilter} from './OpportunityFilter';

// Capitalize hyphenated words
function capitalize(str) {
    return typeof str !== 'string' ? str : str.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const OpportunityList = () => {
    const { data: stages, isLoading} = useGetList(
        'stages',
        { sort: { field: 'order_index', order: 'ASC' } }
    );
    const [totalStages, setTotalStages] = useState(0);
    const [stagesOrder, setStagesOrder] = useState({});
    useEffect(() => {
        if(!stages) return;
        setTotalStages(stages.length);
        const order = {};
        stages.forEach((stage,index) => {
            order[stage.id] = index;
        });
        setStagesOrder(order);
    }, [stages]);
    
    if (isLoading) return <Loading />;
    return (
        <List
            aside={<OpportunityFilter stages={stages} />}
            actions={
                <TopToolbar>
                    <CreateButton />
                    {/* <FilterButton /> */}
                    <ExportButton />
                </TopToolbar>
            }
        >
            <DatagridConfigurable rowClick="show">
                <NumberField source="id" />
                <TextField source="position_title" />
                <TextField source="company_name" />
                <TextField source="company_website" />
                <FunctionField source="company_size" render={r => `${capitalize(r.company_size)}`} />
                <TextField source="company_contacts" />
                <FunctionField source="sentiment" render={r => <Rating name="read-only" value={r.sentiment} readOnly />} />
                <TextField source="sentiment_detail" />
                <FunctionField source="work_arrangement" render={r => `${capitalize(r.work_arrangement)}`} />
                <FunctionField source="employment_type" render={r => `${capitalize(r.employment_type)}`} />
                <TextField source="compensation" />
                <TextField source="location" />
                <BooleanField source="is_remote" looseValue />
                <TextField source="external_url" />
                <TextField source="description" />
                <FunctionField source="close_reason" label="Status" render={r => !r.close_reason ? 'In Progress' : `${capitalize(r.close_reason)}`} />
                <TextField source="additional_detail" />
                {/* display progress based on the latest completed stage */}
                <FunctionField source="stage_ids" label="Stage" render={
                    r => {
                        const ids = JSON.parse(r.stage_ids);
                        const orderedStages = ids.map(id => stagesOrder[id]);
                        const maxStageIndex = Math.max(...orderedStages);
                        const progress = Math.round((maxStageIndex / (totalStages - 1)) * 100);
                        return <LinearProgress variant="determinate" value={progress} />
                    }
                } />
                <DateField source="created_at" />
                <DateField source="updated_at" />
                {/* calculate day since created_at which is in the form of yyyy-mm-dd hh:mm:ss */}
                <FunctionField label="Days Since Created" render={
                    r => {
                        const date = new Date(r.created_at);
                        const today = new Date();
                        const diffTime = Math.abs(today.getTime() - date.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays;
                    }
                } />
            </DatagridConfigurable>
        </List>
    )
};