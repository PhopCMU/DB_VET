import React from "react";

type UseVisitorReturn = {
  data: any;
  isLoading: boolean;
  error: any | null;
  getData: (opts?: any) => Promise<void>;
};

export const FpjsProvider: React.FC<
  React.PropsWithChildren<{ loadOptions?: any }>
> = ({ children }) => {
  return <>{children}</>;
};

export function useVisitor(_options?: any, _config?: any): UseVisitorReturn {
  const getData = async (_opts?: any) => {
    return;
  };

  return {
    data: {},
    isLoading: false,
    error: null,
    getData,
  };
}

export function useFingerprintjsPro() {
  return {
    data: {},
    isLoading: false,
    getData: async () => {},
  };
}

export const FingerprintJSPro = {
  load: async (_opts?: any) => ({
    get: async () => ({}) as any,
  }),
};

export default {
  FpjsProvider,
  useVisitor,
  useFingerprintjsPro,
  FingerprintJSPro,
};
