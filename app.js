var http=require('http');
var listdir=require('./list_dir');
var url = require('url');
var fs=require('fs');
var path_ = require("path");
var os = require('os');

var server=http.createServer(function(req,res){

    if(req.url.includes('/list_dir'))
    {
        
        url_query=url.parse(req.url,true);
        if (url_query.query['path'])
           path=url_query.query['path']
        else 
            path=os.homedir();

        console.log('Path='+path);
        list_of_files=[]
        response_code=200
        listdir.listdir(path,function(err,list){
            list_of_files=list
            console.log(list_of_files);
            if (err){
                console.log('Error='+err.code);
                if (err.code==='ENOENT')
                    response_code=404
                else if (err.code==='EPERM')
                    response_code=403
                else if (err.code==='NOTDIR')
                    response_code=400
                else
                   response_code=500
             
            }
            res.writeHead(response_code,{'Content-Type':'application/json'});
            res.end(JSON.stringify(list_of_files));
        });

    }
    else if (req.url==='/')
    {
        
        var readstream=fs.createReadStream(__dirname+'/index.html','utf8');
        response_code=200;
        readstream.on('error', (err) => {
            console.log('error ' + err);
            });
 
            res.writeHead(response_code,{'Content-Type':'text/html'});
            readstream.pipe(res);
       
        
    }
    else if(req.url.includes('/get_file'))
    {
        var readstream,content_type,response_code=200;
        console.log('enter the get file.');
        try{
                url_query=url.parse(req.url,true);
                if (url_query.query['filepath'])
                filepath=url_query.query['filepath']
                else 
                {
                    throw Error('No filepath supplied');
                }
                console.log('filepath found='+filepath);
                if (filepath.includes('.txt'))
                {
                    readstream=fs.createReadStream(filepath,'utf8');
                    content_type={'Content-Type':'text/html'}
                }
                else if(filepath.includes('.jpg') || filepath.includes('.png'))
                {
                    readstream=fs.createReadStream(filepath);
                    content_type={'Content-Type': 'image/jpeg'};
                }
                else if (filepath.includes('.mp3') )
                {
                    readstream=fs.createReadStream(filepath);
                    content_type={'Content-Type':'audio/mpeg'};
                }
                else if (filepath.includes('.mp4'))
                {
                    readstream=fs.createReadStream(filepath);
                    content_type={'Content-Type':'video/mp4'};
                }
                else{
                    file=path_.basename(filepath);
                    console.log('file name found='+file);
                    res.setHeader('Content-disposition', 'attachment; filename='+file);
                    console.log('header set'+file);
                    readstream=fs.createReadStream(filepath);
                    console.log('read stream created'+file);
                    content_type={'Content-Type':'application/octet-stream'};
                }

                readstream.on('error', (err) => {
                console.log('error ' + err);
                response_code=400;
                });
                
        }
        catch(err)
        {
                console.log('Error='+err);
                response_code=400
        }
        finally
        {
           res.writeHead(response_code,content_type);
           readstream.pipe(res);
            
        }
    }

});

server.listen(8080,'127.0.0.1');