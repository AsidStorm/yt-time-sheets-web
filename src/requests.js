const makeHost = () => {
    let host = `${window.location.protocol}//${window.location.hostname}`;

    if( process.env.REACT_APP_HTTPS_API_PORT || process.env.REACT_APP_API_PORT ) {
        host += `:${window.location.protocol.includes('https:') ? process.env.REACT_APP_HTTPS_API_PORT : process.env.REACT_APP_API_PORT}`
    }

    return host;
};

const host = makeHost();

const headers = (orgId) => {
    const iAmToken = localStorage.getItem('iAmToken');
    const authToken = localStorage.getItem('authToken');

    const headers = {
        "X-Org-ID": orgId ? orgId : localStorage.getItem("orgId")
    };

    if( authToken ) {
        headers["X-Auth-Token"] = authToken;
    }

    if( iAmToken ) {
        headers["X-I-Am-Token"] = iAmToken;
    }

    return headers;
};

export const get = (url, orgId) => {
    const options = {
        headers: headers(orgId)
    };

    return fetch(`${host}${url}`, options).then( responseHandler );
};

export const post = (url, body) => {
    const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers()
    };

    return fetch(`${host}${url}`, options).then( responseHandler );
};

export const patch = (url, body) => {
    const options = {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: headers()
    };

    return fetch(`${host}${url}`, options).then( responseHandler );
};

export const remove = (url, body) => {
    const options = {
        method: "DELETE",
        body: JSON.stringify(body),
        headers: headers()
    };

    return fetch(`${host}${url}`, options).then( responseHandler );
};

const responseHandler = function (response) {
    return response.text().then((text) => {
        let data;

        try {
            data = text && JSON.parse(text);
        } catch (e) {
            return Promise.reject(e);
        }

        if (!response.ok) {
            let err = new Error(response.statusText);
            err.code = response.status;

            if (data && data.errors && data.errors.length > 0) {
                err.message = data.errors.shift().title;
            }

            return Promise.reject(err);
        }

        return data;
    });
};
