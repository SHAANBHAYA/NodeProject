var fs = require('fs');
var path_ = require("path");


function listdir(path,callback){

  //check if the path exist and its not a file
  list_of_files=[]
  
  fs.lstat(path, (err, stats) => {
      if (err){
        callback(err,null);
        return;
      }
      
      if (!stats.isDirectory())
      {
          error=new Error('Path is not a directory.');
          error.code='NOTDIR';
          callback(error,null);
          return;
      }

 

  fs.readdir(path, (err, files) => {
      if (err){
          callback(err,null);
          return;
      }
    counter=0;
    error_flag=null
    var parentDir = path_.join(path, '../');
    list_of_files.push({type:'folder',name:'<-',size:0,path:parentDir,currDir:path});
    if (files.length==0)
    {
        callback(null,list_of_files);
    }
   
    files.forEach(file => {


        fs.lstat(path+'\\'+file, (err, stats) => {
            
                    counter++;
                    if (error_flag && counter===files.length)
                    {
                        callback(error_flag,null);
                        return;
                    }

                    if(err || error_flag)
                    {
                        if (err)
                            error_flag=err
                        return;
                    }
                    if (stats.isFile())
                        list_of_files.push({type:'file',name:file,size:Math.floor(stats.size/1024)+' KB',path:path+'\\'+file})
                    else if (stats.isDirectory())
                        list_of_files.push({type:'folder',name:file,size:stats.size+' KB',path:path+'\\'+file})
                    if (counter===files.length)
                    {
                        callback(null,list_of_files);
                        return;
                    }
               
            

        });
    

        
    });
    
  })
  
});
}

module.exports.listdir=listdir




