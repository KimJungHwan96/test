module.exports = function (server) {
    var io = require('socket.io')(server);
    var PopQuiz = require('../../models/popQuiz');
    var chatRoom = require('../../models/chatRoom');

   
    io.on('connection', function (socket) {




        console.log(socket.id);
        console.log('under connection under socket id');
        socket.on('SEND_MESSAGE', function (data) {
            console.log(data);
            io.in(data.cr_id).emit('RECEIVE_MESSAGE', data);
            //socket.emit('MY_MESSAGE', data); // 나한테만 메세지 전송함
            //socket.broadcast.emit('OTHER_MESSAGE', data); // 본인을 제외한 다른 사람들에게만 메세지 전송함
        });


        // socket.on('storeClientInfo', function (data) {

        //     var clientInfo = new Object();
        //     clientInfo.customId         = data.customId;
        //     clientInfo.clientId     = socket.id;
        //     clients.push(clientInfo);
        // });

            //join room
        socket.on('JOIN_ROOM', function (data) {
            
            var user = 
            {
                socket_id : socket.id,
                email : data.myEmail,
            };

            chatRoom.findOne({_id: data.cr_id }, function(err, data){
                //console.log('up data')
                //console.log(data);
                //console.log(data.participants);
                var length = data.participants.length;
                //socket.join(data.cr_id);

                for(var i = 0; i < length; i++){
                
                    if(user.socket_id != data.participants[i].socketID && user.email == data.participants[i].email)
                    {
                        user.socket_id = data.participants[i].socketID;
                        socket.join(data.cr_id);
                    } else {
                        socket.join(data.cr_id);
                    }
                }
            })

            //console.log('join in the room');
        });

        //leave room
        socket.on('LEAVE_ROOM', function(cr_id) {
            socket.leave(cr_id);
        })

    });

    
    //

    setInterval(() => { // 일정 주기로 팝퀴즈를 반환함
        var data = {};

        PopQuiz.find({}, function(err, datas){ 
            if(err) return err;
            var randomQuizNumber = Math.floor(Math.random() * datas.length); // 팝퀴즈 중 하나 랜덤으로 찾음

            data.author = datas[randomQuizNumber].question; // TODO : 이거 나중에 프론트엔드에 RECEIVE_QUIZ 작성 되면 author -> question으로 수정
            data.message = datas[randomQuizNumber].answer;

            console.log(data);
            io.emit('RECEIVE_MESSAGE', data); // TODO : RECEIVE_QUIZ로 나중에 수정 예정
        })
    }, 2000000); // 시간 주기 설정 (2000 -> 2초)

    return io;
}