
import { useEffect, useState, } from 'react';
import { Card, CardContent, } from '@mui/material';
import { Title, } from 'react-admin';
import { Card as TremorCard, Text, Metric, BarChart } from "@tremor/react";

import { useGetList } from 'react-admin';
import { useClient, Schema, PostgrestResponse, PostgrestSingleResponse } from '@subzerocloud/ra-subzero';

const Dashboard = (props: { schema?: Schema, resources?: string[] }) => {
    const { schema } = props;
    if (!schema) return null; // wait for the schema to be loaded

    // define the state variables
    const [totalStages, setTotalStages] = useState(0);
    const [stagesOrder, setStagesOrder] = useState({});
    const [openOpportunities, setOpenOpportunities] = useState<any>([]);
    const [avgDaysOpen, setAvgDaysOpen] = useState<any>(0);
    const [avgProgress, setAvgProgress] = useState<any>(0);
    const [perWeekApplications, setPerWeekApplications] = useState<any>([]);

    // load the stages
    const { data: stages, isLoading} = useGetList(
        'stages',
        { sort: { field: 'order_index', order: 'ASC' } }
    );
    useEffect(() => {
        if (!stages || isLoading) return;
        setTotalStages(stages.length);
        const order = {};
        stages.forEach((stage, index) => {
            order[stage.id] = index;
        });
        setStagesOrder(order);
    }, [stages, isLoading]);

    // use the subzero client to make calls to the api that leverage the analytics features
    const client = useClient();
    useEffect(() => {
        if(!stagesOrder || !totalStages) return;

        // get the number of applications per week
        client
            .from('opportunities')
            .select(`
                week:$strftime('%Y-%W', created_at),
                total:$count(id)
            `)
            // @ts-ignore
            .groupby('week')
            .then(({ data }) => {
                setPerWeekApplications(data);
            });

        // get the average number of days the applications are open
        client
            .from('opportunities')
            .select(`
                $avg($sub($unixepoch(updated_at),$unixepoch(created_at)))
            `)
            .is('close_reason', 'null')
            .single()
            .then(({ data }:PostgrestSingleResponse<any>) => {
                setAvgDaysOpen(Math.round(data.avg / 86400));
            });

        // get the current number of open applications
        client
            .from('opportunities')
            .select(`
                $count(id)
            `)
            .is('close_reason', 'null')
            .single()
            .then(({ data }:PostgrestSingleResponse<any>) => {
                setOpenOpportunities(data.count);
            });

        // get the stages of all the open applications and calculate the average progress
        client
            .from('opportunities')
            .select(`
                id,
                stage_ids
            `)
            .is('close_reason', 'null')
            .then(({ data }:PostgrestResponse<any>) => {
                const averageProgress = data.reduce((acc, r) => {
                    const ids = JSON.parse(r.stage_ids);
                    const orderedStages = ids.map(id => stagesOrder[id]);
                    const maxStageIndex = Math.max(...orderedStages);
                    const progress = Math.round((maxStageIndex / (totalStages - 1)) * 100);
                    return acc + progress;
                }, 0) / data.length;
                setAvgProgress(averageProgress);
            });
                
    }, [totalStages, stagesOrder]);

    return (
        <Card sx={{marginTop: 3}}>
            <Title title="Dashboard" />
            <CardContent>
                <div className='grid grid-cols-3 gap-4 place-items-start'>
                    <TremorCard className='max-w-lg' decoration="top" decorationColor="blue">
                        <Text>Open Opportunities</Text>
                        <Metric>{openOpportunities}</Metric>
                    </TremorCard>
                    <TremorCard className='max-w-lg' decoration="top" decorationColor="blue">
                        <Text>Average Progress / Application</Text>
                        <Metric>{avgProgress}%</Metric>
                    </TremorCard>
                    <TremorCard className='max-w-lg' decoration="top" decorationColor="blue">
                        <Text>Average Days Since Application</Text>
                        <Metric>{avgDaysOpen}</Metric>
                    </TremorCard>
                </div>
                <div className='mt-5'>
                <TremorCard>
                    <Title>New Applications / week</Title>
                    <BarChart
                        className="mt-6"
                        data={perWeekApplications}
                        index="week"
                        categories={['total']}
                    />
                </TremorCard>
            </div>
            </CardContent>
        </Card>
    );
};

export default Dashboard;
