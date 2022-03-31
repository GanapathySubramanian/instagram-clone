import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/user/user';
import { FileUpload } from 'src/app/core/models/file-upload';
import { FileUploadService } from 'src/app/core/services/media/file-upload.service';
import { PostService } from 'src/app/core/services/post/post.service';
import { ToastNotificationService } from 'src/app/core/services/toaster/toast-notification.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit {

  authenticatedUser: User={} as User;
  disableupload:boolean=true;
  disablechoose:boolean=true;
  
  format:any;
  url:any;
  
  caption:string='';
  length:number=0;
  
  isaccess:boolean=false;
  isadvance=false;
  isdiscard=false;
  isdisableShare=true;
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;

  ngOnInit(): void {
    this.disableupload=true;
    this.disablechoose=true;
    this.authenticatedUser=JSON.parse(localStorage.getItem('user')!);
    if(this.authenticatedUser.profile==null)
    {
      console.log("Empty profile");
      this.authenticatedUser.profile="https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
    }
    
  }


    
    constructor(private postservice:PostService,private userService:UserService,private uploadService: FileUploadService,private toaster:ToastNotificationService) {
      this.displaypost(); 
      this.userService.$authUser.subscribe((data) => {
        this.authenticatedUser = data;
      })
    }



  displaypost() {
    this.postservice.hidepost.subscribe((data)=>{
      this.disablechoose=data;
    })
  }

    showAccessbility(){
      if(this.isaccess==true){
        this.isaccess=false;
      }else{
        this.isaccess=true;
      }
    }

    showAdvanceSetting(){
      if(this.isadvance==true){
        this.isadvance=false;
      }else{
        this.isadvance=true;
      }
    }
    
    captionlength(){
       this.length=this.caption.length;
       if(this.length>0){
          this.isdisableShare=false;
       }
    }

    closeChoose() {
      this.disablechoose=true;
    }

    closeUpload(){
      this.pauseVideo('pause')
      this.disableupload=false;
      this.isdiscard=true;
    }

    discardAll(){
      this.pauseVideo('pause')
      this.isdiscard=false;
      this.disableupload=true;
    }
    
    closeDiscard(){
      // this.pauseVideo('play')
      this.isdiscard=false;
      this.disableupload=false;
      
    }
    
    openChoose(){
      this.disableupload=true;
      this.disablechoose=false;
    }

    pauseVideo = function (s:string) {
      var iframe =document.querySelector( 'iframe');
      var video = document.querySelector( 'video' );
      if ( iframe ) {
        var iframeSrc = iframe.src;
        iframe.src = iframeSrc;
      }
      if ( video &&s=='pause') {
        video.pause();
      }
      if( video && s=='play'){
        video.play();
      }
    };
   onChange(event:any) {

    this.selectFile(event);

      const file = event.target.files && event.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        if(file.type.indexOf('image')> -1){
          this.format = 'image';
        } else if(file.type.indexOf('video')> -1){
          this.format = 'video';
        }
        reader.onload = (event) => {
          this.url = (<FileReader>event.target).result;
          console.log(this.url);
          
        }
        this.disableupload=false;
        this.disablechoose=true;
      }else{
        this.disableupload=true;
          this.disablechoose=false;
      }
    }


    selectFile(event: any): void {
      this.selectedFiles = event.target.files;
    }

    



    upload(): void {
      if (this.selectedFiles) {
        const file: File | null = this.selectedFiles.item(0);
        this.selectedFiles = undefined;
        if (file) {
          this.currentFileUpload = new FileUpload(file);
          let count=0;
          this.uploadService.pushFileToStorage(this.currentFileUpload,this.authenticatedUser.id,'post',this.caption).subscribe(
            percentage => {
              // this.toaster.showPending('Post is uploading wait','info')
              this.percentage = Math.round(percentage ? percentage : 0);
              this.isdisableShare=true;
              if(this.percentage==100){       
                this.caption='';
                this.isdisableShare=false;
                this.disableupload=true;
                if(count===0){
                  this.toaster.showSuccess('Post uploaded successfully','success')
                  count=1;
                }
              }
            },
            error => {
              console.log(error);
              this.toaster.showError('Post upload Failed','error')
            }
          );
        }
      }
    }

}
