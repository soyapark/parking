var center;
var markers;


document.addEventListener('DOMContentLoaded', function() {
    // Check whether the user is authenticated
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $("#footer").show();
            $("#login-btn").hide();
        } else {
            $("#footer").hide();
            $("#login-btn").show();
            localStorage.setItem("callback", "./report.html");
        }

    });

    var imagesList = document.getElementById('images'),
        textInput = document.getElementById('text'),
        sendButton = document.getElementById('send'),
        file = document.getElementById('file');

    // Handle file uploads to Storage
    function handleFileSelect(e) {
        toggleLoading(".loading", true);
        e.preventDefault();


        var files = e.target.files,
            i, file;
        for (i = 0; file = files[i]; i++) {
            //Only pics
            if (!file.type.match('image')) {
                alert("이미지만 업로드할 수 있습니다!");
                return;
            }
            storePicture(file, 0, 1);
        }



        return false;
    }

    var fileArray = [];

    function storePicture(file, inIndex, inLength) {
        var metadata = {
            'contentType': file.type,
        };

        var ref = storage.ref().child([new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()].join("-") + "/test");


        // Data URL string
        var message = "data:image/jpeg;base64,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";
        ref.putString(message, 'data_url').then(function(snapshot) {
            console.log('Uploaded a data_url string!');
        });
    }



    if (window.File && window.FileList && window.FileReader)
        file.addEventListener('change', handleFileSelect, false);
    else alert("해당 브러우저에서 지원되지 않습니다");
});