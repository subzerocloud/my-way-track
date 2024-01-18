
import { useState, ReactElement, useEffect, useRef } from 'react';
//import UserIcon from '@mui/icons-material/People';
import {
    Admin, DataProvider, Resource,
    AppBar, InspectorButton, TitlePortal,
    UserIdentity,
    CustomRoutes, mergeTranslations,
    Loading, Menu,
    //Layout,
} from 'react-admin';
import { Route } from 'react-router-dom';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import {
    CreateGuesser, ListGuesser, EditGuesser, ShowGuesser,
    subzeroDataProvider, createClient,
    loadSchema, canAccessResource,
    formatResourceLabel,
    Schema, preferencePreservingLocalStorageStore,

    raSubzeroEnglishMessages, ClientProvider,
} from '@subzerocloud/ra-subzero';
import Dashboard from './components/Dashboard';
import { OpportunityCreate } from './components/OpportunityCreate';
import { OpportunityEdit } from './components/OpportunityEdit';
import { OpportunityList } from './components/OpportunityList';
import { OpportunityShow } from './components/OpportunityShow';
import Layout from './Layout';

const instanceUrl = import.meta.env.VITE_API_URL || window.location.origin
const defaultListOp = 'eq'; // default operator for list filters

// create the api client, used by the auth and data providers
const client = createClient(instanceUrl);

const i18nProvider = polyglotI18nProvider(() => {
    return mergeTranslations(englishMessages, raSubzeroEnglishMessages);
}, 'en');

const loadPermissions = async () => {
const { data, error } = await client.functions.invoke('permissions', { method: 'GET' });
    if (error) {
        throw error;
    }
    return data;
}

export const App = () => {
    const [schema, setSchema] = useState<Schema | null>(null);
    const [permissions, setPermissions] = useState({});
    const [dataProvider, setDataProvider] = useState<DataProvider>();
    const [dynamicResourceNames, setDynamicResourceNames] = useState<string[]>([]);

    const identity = { id: 1, role: 'authenticated' };
    const isAuthenticated = true;

    // load the schema,permissions and set the dataProvider when the user is authenticated
    // set the user identity (we use this with canAccess functions)
    useEffect(() => {
        Promise.all([loadSchema(client), loadPermissions()])
        .then(([schema, permissions]) => {
            setSchema(schema);
            setPermissions(permissions);
            setDataProvider(subzeroDataProvider({ instanceUrl, client, schema, defaultListOp }));
        });
    }, [isAuthenticated]);


    useEffect(() => {
        if (schema) {
            setDynamicResourceNames(Object.keys(schema)
                .filter(model => !definedResourceNames.includes(model)) // exclude names that are already defined
                .filter(model => !/\s/.test(model)) // exclude names that contain spaces
                .filter(model => { // filter only views and tables
                    const kind = schema[model].kind;
                    return kind === 'view' || kind === 'table';
                })
                .filter(model => { // exclude models where all columns are foreign keys
                    let foreignKeyColumns = schema[model].foreign_keys.map(fk => fk.columns).flat();
                    let allColumns = schema[model].columns.map(col => col.name);
                    return !allColumns.every(col => foreignKeyColumns.includes(col));
                })
                .filter(model => { // exclude models that do not have a primary key
                    return schema[model].columns.some(col => col.primary_key);
                }));
        }
        else {
            setDynamicResourceNames([]);
        }
    }, [schema]);

    const canAccess = (action: string, resource: string, filed?: string) => {
        if (!identity || !permissions) return false;
        return canAccessResource(identity, permissions, action, resource, filed)
    }

    // Add customized resources here (use custom List, Edit, Show components)
    const customizedResources: ReactElement[] = [
        <Resource
            key="opportunities"
            name="opportunities"
            create={canAccess('create','opportunities')?<OpportunityCreate />:undefined}
            list={canAccess('list','opportunities')?<OpportunityList />:undefined}
            edit={canAccess('edit','opportunities')?<OpportunityEdit />:undefined}
            show={canAccess('show','opportunities')?<OpportunityShow />:undefined}
            options={{ label: 'Opportunities', model: schema?.opportunities }}
        />
    ];

    const definedResourceNames: string[] = customizedResources.map((resource) => resource.props.name);
    return (
        <ClientProvider value={client}>
        <Admin
            disableTelemetry
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
            layout={Layout}
            // wait for the schema to be loaded before rendering the dashboard
            dashboard={() => {
                return schema ?
                    <Dashboard
                        schema={schema}
                        resources={[].concat(definedResourceNames).concat(dynamicResourceNames)}
                    />
                    :
                    <Loading />
            }}
            store={preferencePreservingLocalStorageStore()}
        >

            {/* force react admin render when the schema is not yet loaded */}
            <Resource name="dummy" />

            {/* Define customized resources */}
            {customizedResources}

            {/* Define dynamically detected resources based on the database schema */}
            {dynamicResourceNames.map(model => {
                let label = formatResourceLabel(model);
                return (<Resource
                    key={model}
                    name={model}
                    create={canAccess('create',model)?<CreateGuesser canAccess={canAccess} />:undefined}
                    list={canAccess('list',model)?<ListGuesser canAccess={canAccess} />:undefined}
                    edit={canAccess('edit',model)?<EditGuesser canAccess={canAccess} />:undefined}
                    show={canAccess('show',model)?<ShowGuesser canAccess={canAccess} />:undefined}
                    options={{ label, model: schema[model] }}
                />)
            })}

            {
                /*
                in dev mode, log the resource definition to the console
                useful to copy/paste in the resources array above for customization
                */
                false && 
                process.env.NODE_ENV !== 'production' &&
                dynamicResourceNames.length > 0 &&
                (
                    console.log(`Guess resources:`),
                    dynamicResourceNames.map(model => {
                        let label = formatResourceLabel(model);
                        console.log(`
                            <Resource
                                key="${model}"
                                name="${model}"
                                create={canAccess('create','${model}')?<CreateGuesser canAccess={canAccess} />:undefined}
                                list={canAccess('list','${model}')?<ListGuesser canAccess={canAccess} />:undefined}
                                edit={canAccess('edit','${model}')?<EditGuesser canAccess={canAccess} />:undefined}
                                show={canAccess('show','${model}')?<ShowGuesser canAccess={canAccess} />:undefined}
                                options={{ label: '${label}', model: schema?.${model} }}
                            />
                        `);
                    }),
                    null
                )
            }

        </Admin>
        </ClientProvider>
    )
};

