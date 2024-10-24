import React, { createContext, useContext, useReducer } from 'react';

const SalaryContext = createContext();

const salaryReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SALARIES':
            return action.salaries;
        default:
            return state;
    }
};

const SalaryProvider = ({ children }) => {
    const [salaries, dispatch] = useReducer(salaryReducer, {});

    const setSalaries = (newSalaries) => {
        dispatch({ type: 'SET_SALARIES', salaries: newSalaries });
    };

    return (
        <SalaryContext.Provider value={[salaries, setSalaries]}>
            {children}
        </SalaryContext.Provider>
    );
};

const useSalaryState = () => {
    const context = useContext(SalaryContext);
    if (!context) {
        throw new Error('useSalaryState must be used within a SalaryProvider');
    }
    return context;
};

export { SalaryProvider, useSalaryState };
