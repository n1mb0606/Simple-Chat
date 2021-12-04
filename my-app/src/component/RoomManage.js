import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import{ 
    Button,
    InputGroup,
    FormControl,
    Form,
    Container,
    Col,
    Row,
    Tabs,
    Tab,
    Alert
} from 'react-bootstrap'
import socket from '../socket'
import ChatMain from './MainPage';

class RoomCreate extends React.Component{
    constructor(props){
        super(props);
        this.submitRoomCreate = this.submitRoomCreate.bind(this);
        this.copyInnertext = this.copyInnertext.bind(this);
        this.test = this.test.bind(this);
        this.state = { roomcode : '', roompw : ''};
    }
    componentDidMount(){
        socket.on('create_room', (roomn, roomp) => {
            this.setState({roomcode: roomn, roompw: roomp});
        });
    }
    submitRoomCreate(e) {
        e.preventDefault();
        socket.emit('create_room');
    }
    copyInnertext(id) {
        const val = document.getElementById(id).value;
        if(val){
            navigator.clipboard.writeText(val);
        }
    }
    test(e) {
        console.log(document.getElementById("assignedrc").value);
        console.log(e.target);
    }
    render(){
        return(
            <div className="mb-5">
                <Container id="room_input"  onSubmit={this.submitRoomCreate} >
                    <Form>
                    <Row className="mt-5" align="center">
                        <Col>
                            <InputGroup size="lg">
                                <InputGroup.Text>Roomcode</InputGroup.Text>
                                <Form.Control id="assignedrc" type="text" value={this.state.roomcode} readOnly />                            
                                <Button variant="outline-primary" onClick={() => {this.copyInnertext("assignedrc")}}>COPY</Button>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col>
                            <InputGroup size="lg">
                                <InputGroup.Text>Password</InputGroup.Text>
                                <Form.Control id="assignedrp" type="text" value={this.state.roompw} readOnly />    
                                <Button variant="outline-primary" onClick={() => {this.copyInnertext("assignedrp")}}>COPY</Button>                        
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="mt-4" align="center">
                        <Col className="d-grid gap-2">
                            <Button type="submit" size="lg">Create Room</Button>
                        </Col>
                    </Row>
                </Form>
                </Container>                    
                </div>
        );
    }
}
class RoomSelect extends React.Component{
    constructor(props){
        super(props);
        this.state = { roomcode : '', roompw : '', username: '', lgdin: false, checkinputvalid: false, checklgnvalid: false};
        this.handleChangeRoomcode = this.handleChangeRoomcode.bind(this);
        this.handleChangeRoompw = this.handleChangeRoompw.bind(this);
        this.handleChangeUsername = this.handleChangeUsername.bind(this);
        this.submitRoom = this.submitRoom.bind(this);
    }
    componentDidMount() {
        socket.on('room', (lgdin) => {
            this.setState({lgdin: lgdin});
            // if(this.state.lgdin)
            //     this.props.roomSelecter(); 
        });
       
    }
    
    handleChangeUsername(event){
        this.setState({username: event.target.value});
      }
    handleChangeRoomcode(e) {
        this.setState({roomcode : e.target.value});
    }
    handleChangeRoompw(e) {
        this.setState({roompw : e.target.value});
    }
    submitRoom(e) {
        e.preventDefault();
        this.setState({username: '', checkinputvalid: true});
        if(this.state.roomcode && this.state.roompw){
            this.setState({checklgnvalid: true});
            const user_obj = {
                username: this.state.username ? this.state.username : 'Player',
                id: socket.id,
                roomcode: this.state.roomcode,
                roompw: this.state.roompw
            }
            socket.emit('room', user_obj);
        }
    }
    render(){
        return(
            <div className="container-xl">
                <Container className="" id="room_input"  onSubmit={this.submitRoom} >
                    <Form>
                    <Row className="mt-5" align="center">
                        <Col>                           
                            <InputGroup size="lg">                           
                                <InputGroup.Text>Username</InputGroup.Text>
                                <FormControl 
                                    value={this.state.username}
                                    onChange={this.handleChangeUsername}
                                    placeholder="Player"
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="mt-1" align="center">
                        <Col>
                            <InputGroup size="lg">
                                <InputGroup.Text>Roomcode</InputGroup.Text>
                                <FormControl 
                                    value={this.state.roomcode}
                                    onChange={this.handleChangeRoomcode}
                                    placeholder="Roomcode"
                                    isInvalid={this.state.checkinputvalid && !this.state.roomcode.length}
                                />
                                <FormControl.Feedback type="invalid" >
                                    Roomcode is required
                                </FormControl.Feedback>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="mt-1" align="center">
                        <Col>
                            <InputGroup size="lg"  controledId>
                                <InputGroup.Text>Password</InputGroup.Text>
                                <FormControl 
                                    type="password"
                                    value={this.state.roompw}
                                    onChange={this.handleChangeRoompw}
                                    placeholder="Password"
                                    isInvalid= {this.state.checkinputvalid && !this.state.roompw.length}
                                />
                                <FormControl.Feedback type="invalid">
                                    Password is required
                                </FormControl.Feedback>                               
                            </InputGroup>
                            {
                                !this.state.lgdin && this.state.checklgnvalid ? <Alert className="mt-1" variant="danger">                           
                                    Roomcode or password is invalid    
                                </Alert>
                                : <div></div>}
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center mt-1" md="1" align="center">
                        
                    </Row>
                    <Row className="mt-4" align="center">
                        <Col className="d-grid gap-2">
                            <Button type="submit" size="lg">Login</Button>
                        </Col>
                    </Row>
                </Form>
                </Container>                    
                </div>
        );
    }
}
class RoomManage extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div className="chat-app-wrapper">
                <Tabs defaultActiveKey="Select_Room" id="RoomTabs" variant="tabs" className="mb-3">
                    <Tab className="inheirt-height-wrapper" eventKey="Select_Room" title="Select Room">
                        <RoomSelect roomSelecter={this.props.roomSelecter}/>
                    </Tab>
                    <Tab eventKey="Create_Room" title="Create Room">
                        <RoomCreate />
                    </Tab>
                    <Tab eventKey="Chat_Main" title="Chat Room">
                        <ChatMain />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}
export default RoomManage;
