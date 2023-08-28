import { Row, Col, Button } from 'antd'
import { useState } from 'react';

import LeagueCard from "../components/cards/LeagueCard";
import DraftCard from '../components/cards/DraftCard';
const ChooseYourLeagueStep3 = () => {
    const [active, setActive] = useState('home')

    return (
        <div className="game-container">
            <div className="head">
                <div className="home-links">
                    <p className={active === 'home' ? 'active-link' : ""} onClick={() => { setActive('home') }}>Home</p>
                    <span> {">"} </span>
                    <p className={active === 'signUp' ? 'active-link' : ""} onClick={() => { setActive('signUp') }}>Create Sign Up</p>
                </div>
                <div className='btn-container'>
                    <Button>Back</Button>
                </div>
            </div>
            <div className='heading'>
                <h2>Step 3 of 4</h2>
            </div>
            <div className='steps-div'>
                <div className='step active-step'>
                    <p>1</p>
                </div>
                <div className='line-border active-step' />
                <div className='step active-step'>
                    <p>2</p>
                </div>
                <div className='line-border active-step' />
                <div className='step active-step'>
                    <p>3</p>
                </div>
                <div className='line-border' />
                <div className='step'>
                    <p>4</p>
                </div>
            </div>
            <Row gutter={[32, 32]}>
                <Col xs={24} md={8} lg={6}>
                    <LeagueCard />
                </Col>
                <Col xs={24} md={16} lg={18}>
                    <DraftCard />
                </Col>
            </Row>
        </div>
    )
}

export default ChooseYourLeagueStep3;