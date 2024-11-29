const cc = DataStudioApp.createCommunityConnector();

const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
    }
};

// Define the expected types for your data structure
interface SampleData {
    [key: string]: 'number' | 'string' | 'date';
}

interface DataItem {
    [key: string]: number | string | null;
}

const fetchData = (url: string): any => {
    try {
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    } catch (error) {
        Logger.log(`Error fetching data from ${url}: ${error}`);
        throw new Error('Failed to fetch data from the API');
    }
};

const getFields = () => {
    const fields = cc.getFields();
    const schema = {
        average3TR: {
            count: "number"
        },
        averageYear3TR: {
            count: "number"
        },
        averageMonth3TR: {
            count: "number"
        },
        paying_companies: [
            {
                product_name: "string",
                count: "number"
            }
        ],
        average_owner_activity: [
            {
                company_id: "number",
                name: "string",
                user_id: "number",
                average_days_since_last_login: "number"
            }
        ]
    };

    for (const [groupKey, nestedFields] of Object.entries(schema)) {
        if (Array.isArray(nestedFields)) {
            nestedFields.forEach((field) => {
                for (const [key, type] of Object.entries(field)) {
                    const fieldId = `${groupKey}_${key}`;
                    switch (type) {
                        case 'number':
                            fields.newMetric()
                                .setId(fieldId)
                                .setName(fieldId)
                                .setType(cc.FieldType.NUMBER);
                            break;
                        case 'string':
                            fields.newDimension()
                                .setId(fieldId)
                                .setName(fieldId)
                                .setType(cc.FieldType.TEXT);
                            break;
                        default:
                            Logger.log(`Unsupported field type for key ${fieldId}: ${type}`);
                    }
                }
            });
        } else {
            for (const [key, type] of Object.entries(nestedFields)) {
                const fieldId = `${groupKey}_${key}`;
                switch (type) {
                    case 'number':
                        fields.newMetric()
                            .setId(fieldId)
                            .setName(fieldId)
                            .setType(cc.FieldType.NUMBER);
                        break;
                    case 'string':
                        fields.newDimension()
                            .setId(fieldId)
                            .setName(fieldId)
                            .setType(cc.FieldType.TEXT);
                        break;
                    default:
                        Logger.log(`Unsupported field type for key ${fieldId}: ${type}`);
                }
            }
        }
    }

    return fields;
};

function getSchema() {
    return cc.newGetSchemaResponse()
        .setFields(getFields())
        .build();
}

const getData = (request: { fields: { name: string }[] }) => {
    const requestedFieldIds = request.fields.map(field => field.name);
    const url = 'https://backoffice.zooza.app/bo-v2/looker/zooza';
    const data = fetchData(url);

    const Rows: any[] = [];

    for (const [groupKey, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                const row: any[] = [];
                requestedFieldIds.forEach(fieldId => {
                    const [group, key] = fieldId.split('_');
                    if (group === groupKey) {
                        row.push(item[key] ?? null);
                    } else {
                        row.push(null);
                    }
                });
                Rows.push(row);
            });
        } else if (typeof value === 'object' && value !== null) {
            const row: any[] = [];
            requestedFieldIds.forEach(fieldId => {
                const [group, key] = fieldId.split('_');
                if (group === groupKey) {
                    // @ts-ignore
                    row.push(value[key] ?? null);
                } else {
                    row.push(null);
                }
            });
            Rows.push(row);
        }
    }

    const fields = getFields();

    return cc.newGetDataResponse()
        .setFields(fields.forIds(requestedFieldIds))
        .addAllRows(Rows)
        .build();
};


function getConfig() {
    return cc.getConfig().build();
}

function getAuthType() {
    const authTypes = cc.AuthType;
    return cc
        .newAuthTypeResponse()
        .setAuthType(authTypes.NONE)
        .build();
}
