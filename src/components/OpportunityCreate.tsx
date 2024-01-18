import {
    Create,SimpleForm,
} from 'react-admin';
import { OpportunityForm } from './OpportunityForm';

export const OpportunityCreate = () => (
    <Create>
        <SimpleForm><OpportunityForm /></SimpleForm>
    </Create>
);