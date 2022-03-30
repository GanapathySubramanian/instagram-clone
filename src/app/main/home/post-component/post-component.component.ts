import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post/post';
import { PostService } from 'src/app/core/services/post/post.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-post-component',
  templateUrl: './post-component.component.html',
  styleUrls: ['./post-component.component.scss']
})
export class PostComponentComponent implements OnInit {

  
  

  constructor(private postservice:PostService,private userService: UserService, private http: HttpClient) { }

  posts: Post[] = [];

  ngOnInit(): void {
    this.postservice.homeProfilePosts(this.userService.getAuthUser().id).subscribe(data => {
      console.log("pp" + data);
      
      this.posts = data;
      this.posts.forEach((post:Post) => {
        this.userService.getUserWithId(post.userId).subscribe( (user) => {
          post.username = user.username;
          post.profileLink = user.profile;
          // if(post.likes!=0)
          // this.postservice.userIsLiked(this.userService.getAuthUser().userId, post.postId).subscribe((like) => {
          //   if(like!=undefined){
          //     post.isLiked = true;
          //     post.liked = like;
          //   }
          //   else{
          //     post.isLiked = false;
          //   }
          // })
        })
    })
  })
  }



 




}
