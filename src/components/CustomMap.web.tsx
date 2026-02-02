import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomMap = forwardRef((props: any, ref: any) => {
    return (
        <View style={[props.style, styles.webMapPlaceholder]}>
            <Text style={styles.text}>Map is not supported on web version yet.</Text>
            <Text style={styles.subText}>Please use use mobile app for full functionality.</Text>
        </View>
    );
});

export const Marker = (props: any) => null;
export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
    webMapPlaceholder: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
    },
    subText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    }
});

export default CustomMap;
