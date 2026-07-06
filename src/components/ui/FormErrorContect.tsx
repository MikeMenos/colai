import type { ErrorCtx } from "./FormErrorContect.types";
import React from "react";

const FormErrorsContext = React.createContext<ErrorCtx>({ errors: {} });


export default FormErrorsContext
