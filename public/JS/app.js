
        const editBtn = document.getElementById('edit')
        const doneBtn = document.getElementById("Done")
        const title = document.getElementById("title")
        const snippet = document.getElementById("snippet")
        const body = document.getElementById("body")

        editBtn.addEventListener("click", function(){
            title.contentEditable = true;
            snippet.contentEditable = true;
            body.contentEditable = true;

            title.style.backgroundColor = "#dddbdb";
            snippet.style.backgroundColor = "#dddbdb";
            body.style.backgroundColor = "#dddbdb";
        })

        doneBtn.addEventListener("click", function(){
       
            title.contentEditable = false;
            snippet.contentEditable = false;
            body.contentEditable = false; 

            title.style.backgroundColor = "#fff";
            snippet.style.backgroundColor = "#fff";
            body.style.backgroundColor = "#fff";
        })
