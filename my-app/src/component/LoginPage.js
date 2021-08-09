import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

class LoginPage extends React.Component{
    constructor(props){
        super(props);

    }
    render(){
        return(
            <div>
                <Container fluid>
                    <Row>
                        <Col>
                            <InputGroup size="lg">
                                <InputGroup.Text>Username</InputGroup.Text>
                                <FormControl 
                                    placeholder="Username"
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button>Login</Button>
                        </Col>
                    </Row>
                
                </Container>                    
                
            </div>
        );
    }
}

export default LoginPage