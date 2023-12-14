
import { useState, ReactElement, useEffect } from 'react';
//import UserIcon from '@mui/icons-material/People';
import {
    Admin, DataProvider, Resource, Layout,
    AppBar, InspectorButton, TitlePortal,
    UserIdentity,
    CustomRoutes, mergeTranslations,
    Loading, Menu,
} from 'react-admin';
import { Route } from 'react-router-dom';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import {
    CreateGuesser, ListGuesser, EditGuesser, ShowGuesser,
    subzeroAuthProvider, subzeroDataProvider, createClient,
    loadSchema, canAccessResource,
    formatResourceLabel,
    Schema, preferencePreservingLocalStorageStore,
    LoginPage, SetPasswordPage, ForgotPasswordPage,
    raSubzeroEnglishMessages, ClientProvider,
} from '@subzerocloud/ra-subzero';
import Dashboard from './components/Dashboard';

const instanceUrl = import.meta.env.VITE_API_URL || window.location.origin
const defaultListOp = 'eq'; // default operator for list filters

// create the api client, used by the auth and data providers
const client = createClient(instanceUrl);

const i18nProvider = polyglotI18nProvider(() => {
    return mergeTranslations(englishMessages, raSubzeroEnglishMessages);
}, 'en');

// we use a custom layout and app bar to add the inspector button (triggers UI customization)
const MyAppBar = () => <AppBar><TitlePortal /><InspectorButton /></AppBar>;
const MyMenu = () =>
    <div className="h-full">
        <Menu hasDashboard={true} />
        <a href="https://subzero.cloud" className="absolute bottom-0 left-0 ">
            <img className="w-24 ml-5 mb-5" src="https://subzero.cloud/builtwithlogo.svg" />
        </a>
    </div>;
const MyLayout = (props: any) => <Layout {...props} appBar={MyAppBar} menu={MyMenu} />;

export const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identity, setIdentity] = useState<UserIdentity>();
    const [schema, setSchema] = useState<Schema | null>(null);
    const [permissions, setPermissions] = useState({});
    const [dataProvider, setDataProvider] = useState<DataProvider>();
    const [dynamicResourceNames, setDynamicResourceNames] = useState<string[]>([]);

    const authProvider = subzeroAuthProvider(client, {
        onLoginStateChanged: (isAuthenticated: boolean) => setIsAuthenticated(isAuthenticated),
    });
    
    // check if the user is authenticated
    useEffect(() => {
        authProvider.checkAuth().then(() => setIsAuthenticated(true)).catch(() => setIsAuthenticated(false));
    }, []);

    // load the schema,permissions and set the dataProvider when the user is authenticated
    // set the user identity (we use this with canAccess functions)
    useEffect(() => {
        if (isAuthenticated) {
            authProvider.getIdentity().then(identity => setIdentity(identity));
            Promise.all([loadSchema(client), authProvider.getPermissions()])
                .then(([schema, permissions]) => {
                    setSchema(schema);
                    setPermissions(permissions);
                    setDataProvider(subzeroDataProvider({ instanceUrl, client, schema, defaultListOp }));
                });
        }
        else {
            setIdentity(undefined);
            setSchema(null);
            setPermissions({});
            setDataProvider(undefined);
            setDynamicResourceNames([]);
        }
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
        // <Resource
        //     key="todos"
        //     name="todos"
        //     create={canAccess('create','todos')?<CreateGuesser canAccess={canAccess} />:undefined}
        //     list={canAccess('list','todos')?<ListGuesser canAccess={canAccess} />:undefined}
        //     edit={canAccess('edit','todos')?<EditGuesser canAccess={canAccess} />:undefined}
        //     show={canAccess('show','todos')?<CreateGuesser canAccess={canAccess} />:undefined}
        //     options={{ label: 'Todos', model: schema?.todos, filterToQuery: s => ({ 'title@ilike': `%${s}%` }) }}
        //     recordRepresentation={(r) => `${r.title}`}
        // />,
    ];

    const definedResourceNames: string[] = customizedResources.map((resource) => resource.props.name);

    return (
        <ClientProvider value={client}>
        <Admin
            disableTelemetry
            requireAuth
            dataProvider={dataProvider}
            authProvider={authProvider}
            loginPage={
                <LoginPage
                    //disableForgotPassword
                    //disableEmailPassword
                    // providers={['github']}
                    // domains={['subzero.cloud']}
                />
            }
            i18nProvider={i18nProvider}
            layout={MyLayout}
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
            <CustomRoutes noLayout>
                <Route
                    path={SetPasswordPage.path}
                    element={<SetPasswordPage />}
                />
                <Route
                    path={ForgotPasswordPage.path}
                    element={<ForgotPasswordPage />}
                />
            </CustomRoutes>

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

