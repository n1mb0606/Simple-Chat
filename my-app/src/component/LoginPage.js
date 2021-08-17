import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import{ 
    Button,
    InputGroup,
    FormControl,
    Form,
    Container,
    Col,
    Row 
} from 'react-bootstrap';
import socket from '../socket';

class LoginPage extends React.Component{
    constructor(props){
        super(props);
        this.SubmitUsername = this.SubmitUsername.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {usename: ''};
    }
    SubmitUsername(e){
        e.preventDefault();
        if(this.state.username){
            const user_obj = {
                userName: this.state.username,
                id: socket.id
            }
            socket.emit('user_name', user_obj);
            this.props.loginChecker();
            this.setState({username: ''});
        }
    }
    
    handleChange(e){
        this.setState({username: e.target.value});
    }
    
    render(){
        return(
            <div className="mb-5">
                {this.state.username}
                <Container id="user_input"  onSubmit={this.SubmitUsername} >
                    <Form>
                    <Row className="mt-5" align="center">
                        <Col>
                            <InputGroup size="lg">
                                <InputGroup.Text>Username</InputGroup.Text>
                                <FormControl 
                                    value={this.state.username}
                                    onChange={this.handleChange}
                                    placeholder="Username"
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="mt-3" align="center">
                        <Col>
                            <Button type="submit" size="lg">Login</Button>
                        </Col>
                    </Row>
                </Form>
                </Container>                    
                
            </div>
        );
    }
}

export default LoginPage;