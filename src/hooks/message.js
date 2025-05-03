import {useAtom} from "jotai";
import {messageAtom} from "../jotai/atoms";

export function useMessage() {
    const [ state, setState ] = useAtom(messageAtom);

    return {
        showSuccess: message => setState({open: true, message, type: "success"}),
        showError: message => setState({open: true, message: message instanceof Error ? message.message : message, type: "error"}),

        close: () => setState( prev => ({...prev, open: false})),

        isOpen: state.open,
        message: state.message,
        type: state.type
    };
}