import {
    BooleanInput, TextInput,
    SelectInput, Labeled, ReferenceArrayInput, CheckboxGroupInput,
    required,
} from 'react-admin';
import React from 'react';
import { Rating } from '@mui/material';

import { useController } from 'react-hook-form';

const RatingInput = ({ source }: { source: string }) => {
    const {
        field,
    } = useController({ name: source, defaultValue: 0 });
    // Convert the string value to a number
    const numericValue = field.value ? Number(field.value) : 0;

    return (<>
        <Labeled label='Sentiment'>
            <Rating {...field}  value={numericValue} />
        </Labeled>
    </>);
};

export const OpportunityForm = () => (
    <>
            <div className='text-xl'>Key essentials</div>
            <TextInput source="position_title" fullWidth validate={required()}/>
            <TextInput source="company_name" fullWidth validate={required()}/>
            <TextInput source="company_website" fullWidth />
            <SelectInput source="company_size" choices={[
                { id: 'very-small', name: 'Very Small (1-10 employees)' },
                { id: 'small', name: 'Small (11-50 employees)' },
                { id: 'medium', name: 'Medium (51-200 employees)' },
                { id: 'large', name: 'Large (201-500 employees)' },
                { id: 'enterprise', name: 'Enterprise (501-1000 employees)' },
                { id: 'large-enterprise', name: 'Large Enterprise (1000+ employees)' },
            ]} fullWidth />
            <div className='m-10' />

            <div className='text-xl'>My journey</div>
            <ReferenceArrayInput
                source="stage_ids"
                reference="stages"
                sort={{ field: 'order_index', order: 'ASC' }}
            >
                <CheckboxGroupInput
                optionText="stage_name"
                row={false}
                format={v => typeof v === 'string' ? JSON.parse(v) : v}
                parse={v => JSON.stringify(v)}
                />
            </ReferenceArrayInput>
            <TextInput source="company_contacts" fullWidth />
            <RatingInput source="sentiment"  />
            <TextInput source="sentiment_notes" fullWidth multiline />
            <div className='m-10' />

            <div className='text-xl'>Job details</div>
            <SelectInput source="work_arrangement" choices={[
                { id: 'full-time', name: 'Full-time' },
                { id: 'part-time', name: 'Part-time' },
            ]} fullWidth />
            <SelectInput source="employment_type" choices={[
                { id: 'permanent', name: 'Permanent' },
                { id: 'contract', name: 'Contract' },
                { id: 'temporary', name: 'Temporary' },
                { id: 'internship', name: 'Internship' },
            ]} fullWidth />
            <TextInput source="compensation" fullWidth multiline />
            <TextInput source="location" fullWidth />
            <BooleanInput source="is_remote" fullWidth />
            <TextInput source="external_url" fullWidth />
            <TextInput source="description" fullWidth multiline />
            <div className='m-10' />

            <div className='text-xl'>Job details</div>
            <SelectInput source="close_reason" choices={[
                { id: 'accepted', name: 'Accepted' },
                { id: 'declined', name: 'Declined' },
                { id: 'withdrawn', name: 'Withdrawn' },
                { id: 'other', name: 'Other' },
            ]} fullWidth />
            <TextInput source="additional_detail" fullWidth />
    </>
);