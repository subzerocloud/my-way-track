import {
    SimpleForm, Edit, useEditContext, useEditController
} from 'react-admin';
import { OpportunityForm } from './OpportunityForm';

export const OpportunityEdit = (props) => {
    const { record } = useEditController();
    if (!record) return null;
    return (
        <Edit {...props}>
            <SimpleForm><OpportunityForm /></SimpleForm>
        </Edit>
    )
};