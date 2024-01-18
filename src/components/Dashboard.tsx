
import { useEffect, useState, } from 'react';
import { Card, CardContent, } from '@mui/material';
import { Title, } from 'react-admin';
import { Card as TremorCard, Text, Metric, BarChart } from "@tremor/react";

import {
    TopToolbar,useGetList
} from 'react-admin';
import { useClient, Schema, PostgrestResponse, PostgrestSingleResponse } from '@subzerocloud/ra-subzero';


// const valueFormatter = (number: number) => `${Intl.NumberFormat("us").format(number).toString()} kg`;
const Dashboard = (props: { schema?: Schema, resources?: string[] }) => {
    const { schema } = props;
    if (!schema) return null;
    const client = useClient();
    const { data: stages, isLoading} = useGetList(
        'stages',
        { sort: { field: 'order_index', order: 'ASC' } }
    );
    const [totalStages, setTotalStages] = useState(0);
    const [stagesOrder, setStagesOrder] = useState({});
    useEffect(() => {
        if(!stages || isLoading) return;
        setTotalStages(stages.length);
        const order = {};
        stages.forEach((stage,index) => {
            order[stage.id] = index;
        });
        setStagesOrder(order);
    }, [stages, isLoading]);
    const [openOpportunities, setOpenOpportunities] = useState<any>([]);
    const [avgDaysOpen, setAvgDaysOpen] = useState<any>(0);
    const [avgProgress, setAvgProgress] = useState<any>(0);
    const [perWeekApplications, setPerWeekApplications] = useState<any>([]);
    useEffect(() => {
        if(!stagesOrder || !totalStages) return;
        client
            .from('opportunities')
            .select(`
                week:$strftime('%Y-%W', created_at),
                total:$count(id)
            `)
            // @ts-ignore
            .groupby('week')
            .then(({ data, error }) => {
                //console.info('by week', data);
                setPerWeekApplications(data);
            });
        // get the average number of days the applications are open
        // use created_on and updated_on to calculate the number of days
        client
            .from('opportunities')
            .select(`
                $avg($sub($unixepoch(updated_at),$unixepoch(created_at)))
            `)
            .is('close_reason', 'null')
            .single()
            .then(({ data, error }:PostgrestSingleResponse<any>) => {
                //console.info('avg days open', data.avg / 86400);
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
            .then(({ data, error }:PostgrestSingleResponse<any>) => {
                //console.info('open applications', data.count);
                setOpenOpportunities(data.count);
            });
        
        // get the stages of all the open applications
        client
            .from('opportunities')
            .select(`
                id,
                stage_ids
            `)
            .is('close_reason', 'null')
            .then(({ data, error }:PostgrestResponse<any>) => {
                const averageProgress = data.reduce((acc, r) => {
                    const ids = JSON.parse(r.stage_ids);
                    const orderedStages = ids.map(id => stagesOrder[id]);
                    const maxStageIndex = Math.max(...orderedStages);
                    const progress = Math.round((maxStageIndex / (totalStages - 1)) * 100);
                    return acc + progress;
                }, 0) / data.length;
                //console.info('average progress', averageProgress);
                setAvgProgress(averageProgress);
            });
                
    }, [stagesOrder, totalStages]);

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