import React, { forwardRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const CustomMap = forwardRef((props: any, ref: any) => {
    return <MapView ref={ref} {...props} />;
});

export { Marker, PROVIDER_GOOGLE };
export default CustomMap;
