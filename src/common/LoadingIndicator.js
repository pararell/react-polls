import React from 'react';
import { Spin } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';

export default function LoadingIndicator(props) {
    const antIcon = <Loading3QuartersOutlined type="loading-3-quarters" style={{ fontSize: 30 }} spin />;
    return (
        <Spin indicator={antIcon} style = {{display: 'block', textAlign: 'center', marginTop: 30}} />
    );
}