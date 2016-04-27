window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
Progressable.FileSystem = {
  errorHandler: function (e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
    }
  },
  system: function () {
    if (Progressable.FileSystem.fileSystem) {
      return new Promise(function(s) {
          s(Progressable.FileSystem.fileSystem)
      })
    } else {
      return new Promise(function (s){
      window.requestFileSystem(window.TEMPORARY, 1024*1024,function (fileSystem) {
          s(Progressable.FileSystem.fileSystem = fileSystem);
      })
    })
    }
  },
  root: function () {
    return new Promise(function (s) {
      Progressable.FileSystem.system().then(function (system) {
        s(system.root)
      })
    })

  },
  directory: function (fullPath,createIfNotExist) {
    var directories = [];
    if (fullPath == "." || fullPath === "" || fullPath == "/") {
      return this.root()

    }
    directories = fullPath.split("/")
    var success, failure;
    var promise = new Promise(function (s,f){
      success = s;
      failure = f
    })


    directories = fullPath.split("/");

    function getAgain(directory) {
      if (directories.length) {
        Progressable.FileSystem.childDirectory(directory,directories.shift(),true).then(getAgain)
      } else {
        success(directory)
      }
    }
    getAgain(this.fileSystem.root)
    return promise
  },
  childDirectory: function (currentDirectory, directoryName, createIfNotExist) {
    var success, failure, promise = new Promise(function (s,f) {
      success = s;
      failure = f;

    })
    currentDirectory.getDirectory(directoryName,{create:createIfNotExist||false}, function (directory) {
      success(directory)
    }, function (e) {
      console.log(e)
      failure(e)

    })
    return promise

  },
  entries: function (path) {
    var success, failure, promise = new Promise(function (s,f) {
      success = s;
      failure = f;

    })//DOES NOT ITERATE OVER EVERY POSSIBLE FILE
    this.directory(path).then(function (directory) {
          directory.createReader().readEntries(function (entries) {
            success([].concat.apply([],entries))
          })
    })
    return promise;
  },
  directoryEntries: function (path) {
    var that = this;
    return new Promise(function (success,f) {
      that.entries(path).then(function (entries) {
      success(entries.filter(function (entry) {
        return entry.isDirectory
      }))
    })

    });
  },
  fileEntries: function (path) {
    var that = this;
    return new Promise(function (success,f) {
      that.entries(path).then(function (entries) {
      success(entries.filter(function (entry) {
        return entry.isFile
      }))
    })

    });
  },
  files: function (path) {
    return this.fileEntries(path).then(function (fileEntries) {
      var files = [];
      return new Promise(function (success, failure) {
      fileEntries.forEach(function (entry) {
        entry.file(function (file) {
          files.push(file)
          if (files.length == fileEntries.length) {
            success(files)

          }
        })
      })
    })
})
  },

  createTextFile: function (fullPath,content) {
    var path = fullPath.split("/"),
        filename = path.pop(),
        that = this;
     return new Promise(function (success,failure) {

      that.directory(path.join('/'),true).then(function (directory) {
      directory.getFile(filename,{create:true}, function (fileEntry) {
        fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function() {
        fileEntry.file(success)
      };

      fileWriter.onerror = function(e) {
         failure(e)
      };

      // Create a new Blob and write it to log.txt.
      var blob = new Blob([content||''], {type: 'text/plain'});

      fileWriter.write(blob);

    }, Progressable.FileSystem.errorHandler);


      })
    })
  })
   },
     createJsonFile: function (fullPath,content) {
    var path = fullPath.split("/"),
        filename = path.pop(),
        that = this;
     return new Promise(function (success,failure) {

      that.directory(path.join('/'),true).then(function (directory) {
      directory.getFile(filename,{create:true}, function (fileEntry) {
        fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function() {
        fileEntry.file(success)
      };

      fileWriter.onerror = function(e) {
         failure(e)
      };

      // Create a new Blob and write it to log.txt.
      var blob = new Blob([content||''], {type: 'application/json'});

      fileWriter.write(blob);

    }, Progressable.FileSystem.errorHandler);


      })
    })
  })


},
  readTextFile: function (){},
  saveUserFiles: function (directoryPath,fileInputOrFileCollection) {
    var that = this,
      files = fileInputOrFileCollection.files ? fileInputOrFileCollection.files : fileInputOrFileCollection; 
    return new Promise(function (successs, failure) {
      var successs = function () {
        alert('here');
        success("ook")
      }

      return that.directory(directoryPath).then(function (directory) {
          var completedFiles = 0;
          for (var i=0,length=files.length,scopedFiles = files,file;i!=length;i++) {
            (function (file) {
              directory.getFile(file.name, {create: true, exclusive: false}, function(fileEntry) {
              console.log("getFile")
          fileEntry.createWriter(function(fileWriter) {
            //console.log(file.name)

            fileWriter.write(file, function () {
              console.log("write")
              completedFiles++;
              if (completedFiles == length-1) {
                success("OOK")
              }
            }, function () {
              errorHandler.apply(null,arguments)
              completedFiles++;
              if (completedFiles == length-1) {
                success("OOK")
              }

            }); // Note: write() can take a File or Blob object.
          }, function () {
             Progressable.FileSystem.errorHandler.apply(null,arguments)
              completedFiles++;
              if (completedFiles == length-1) {
                success("OOK")
              }

            });
        }, Progressable.FileSystem.errorHandler);
            })(scopedFiles[i])
            
            
          }
      })
    })
  }
}

