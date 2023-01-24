import React from 'react';
import crispyGasm from "../data/images/CrispyGasm112x112.png";

const OnlyFansPage = ({ data }) => {
    return (
        <div className='w-screen h-screen' style={{
            backgroundImage: `url(${crispyGasm})`,
            backgroundRepeat: 'repeat',
        }}>
        </div>
    )
}

export default OnlyFansPage;