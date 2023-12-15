import React, { useState, useEffect } from 'react';
import { Show, useShowContext, useGetList } from 'react-admin';
import { LinearProgress, Rating, } from '@mui/material';
const SimpleOpportunityShow = () => {
    const { record, isLoading: recordLoading } = useShowContext();
    const { data: stages, isLoading: stagesLoading } = useGetList(
        'stages',
        { sort: { field: 'order_index', order: 'ASC' } }
    );
    const [totalStages, setTotalStages] = useState(0);
    const [stagesOrder, setStagesOrder] = useState({});
    useEffect(() => {
        if (!stages) return;
        setTotalStages(stages.length);
        const order = {};
        stages.forEach((stage, index) => {
            order[stage.id] = index;
        });
        setStagesOrder(order);
    }, [stages]);
    if (recordLoading || stagesLoading || !record) return null;
    // Breadcrumbs rendering logic
    const renderBreadcrumbs = () => {
        if (!stages || !record.stage_ids) return null;

        // Parse stage_ids from record
        const ids = JSON.parse(record.stage_ids);

        // Filter and sort the stages according to the ids and order_index
        const filteredStages = stages
            .filter(stage => ids.includes(stage.id))
            .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

        return filteredStages.map((stage, index) => (
            <span key={stage.id}>
                {stage.stage_name}
                {index < filteredStages.length - 1 && ' > '}
            </span>
        ));
    };

    const ids = JSON.parse(record.stage_ids);
    const orderedStages = ids.map(id => stagesOrder[id]);
    const maxStageIndex = Math.max(...orderedStages);
    const progress = Math.round((maxStageIndex / (totalStages - 1)) * 100);
    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            {/* Company Block */}
            <div className="mb-4">
                <h2 className="text-xl font-bold">
                    {record.position_title} at {record.company_name}
                    <Rating name="read-only" value={record.sentiment} readOnly />
                </h2>
                <p><a href={record.company_website} className="text-blue-400 underline">{record.company_website}</a></p>
            </div>
                {/* Opportunity Details Block */}
            <div className="mb-4">
            <p className="text-md">
                {record.compensation}, {record.work_arrangement}, {record.employment_type}, {record.location}
                {record.is_remote && <span className="mx-1">(Remote)</span>}
            </p>

                <p><a href={record.external_url} className="text-blue-400 underline">{record.external_url}</a></p>
            </div>
            <p>{record.description}</p>
            <p>{record.sentiment_detail}</p>
            {record.close_reason ?
                (
                    <p className="text-red-500">Closed: {record.close_reason}</p>
                )
                :
                (
                    <div>
                        <LinearProgress variant="determinate" value={progress}
                            className='w-1/2'
                        />
                        <div className="mt-2">{renderBreadcrumbs()}</div>
                    </div>
                )
            }

            {/* Contact Block */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Company Contact</h3>
                <p>{record.company_contacts}</p>
            </div>
        </div>
    );
};

export const OpportunityShow = () => (
    <Show>
        <SimpleOpportunityShow />
    </Show>
);