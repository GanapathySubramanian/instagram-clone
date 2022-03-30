import { Injectable } from '@angular/core';
import {PostForm} from "../../interfaces/post/post-form";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FileUploadService} from "../media/file-upload.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import { Comment } from "../../interfaces/react/comment";
import {finalize, map} from "rxjs/operators";
import {Like} from "../../interfaces/react/like";
import {PostHover} from "../../interfaces/profile/post-hover";
import {Post} from "../../interfaces/post/post";

@Injectable({
  providedIn: 'root'
})
export class PostService {

  
  private hidecreatepost = new BehaviorSubject<boolean>(true);
  hidepost = this.hidecreatepost.asObservable();

  private viewpost = new BehaviorSubject<boolean>(true);
  showpostData = this.viewpost.asObservable();

  private postURL = new BehaviorSubject<string>("");
  $postURL = this.postURL.asObservable();
  
  private postid = new BehaviorSubject<string>("");
  $postid = this.postid.asObservable();


  private baseURL: string = 'https://instagram-clone-e824c-default-rtdb.firebaseio.com/'

  constructor( private http: HttpClient) { }

  getPost( postId: string): Observable<any> {
    return this.http.get(`${this.baseURL}posts/${postId}.json`);
  }

  getPostComments( postId: string): Observable<any> {
    return this.http.get(`${this.baseURL}comments.json`).pipe(
      map((data: any) => {
        if(data){
            let comments: Comment[] = [];
            Object.keys(data).forEach( key => {
              if( postId === data[key].postId) {
                let temp: Comment = {
                  commentId: key,
                  userId: data[key].userId,
                  postId: data[key].postId,
                  text: data[key].text,
                  username: data[key].username,
                  timeStamp: data[key].timeStamp
                }
                comments.push(temp);
              }
            });
            return comments;
        }
        return [];
      })
    );
  }

  createPost( post: PostForm): Observable<any> {
    post.likes = 0;
    post.comments = 0;
    return this.http.post(this.baseURL + 'posts.json', post);
  }

  likePost( like: Like): Observable<any> {
    return this.http.post( this.baseURL + 'likes.json', like).pipe(
      map((data) => {
        console.log("userid: " + like.userId);
        
        console.log('post return '+data);
        this.getPost(like.postId).subscribe( (data: Post) => {
          this.updateLikeCount(like.postId, data.likes+1).subscribe();
        });
        return true;
    })
    );
  }

  commentPost( comment: Comment): Observable<any> {
    return this.http.post( this.baseURL + 'comments.json', comment).pipe(
      map((data) => {
        console.log('post return '+data);
        this.getPost(comment.postId).subscribe( (data: Post) => {
          this.updateLikeCount(comment.postId, data.comments+1).subscribe();
        });
        return true;
      })
    );
  }

  updateLikeCount( postId: string, count: number): Observable<any> {
    return this.http.patch(`${this.baseURL}posts/${postId}.json`, { likes: count });
  }

  updateCommentCount( postId: string, count: number): Observable<any> {
    return this.http.patch(`${this.baseURL}posts/${postId}.json`, { comments: count });
  }

   

  unlikePost( unlike: Like): Observable<any> {
    return this.http.delete( `${this.baseURL}likes/${unlike.likeId}.json`).pipe(
      map((data) => {
        console.log('post return '+data);
        this.getPost(unlike.postId).subscribe( (data: Post) => {
          this.updateLikeCount(unlike.postId, data.likes-1).subscribe();
        });
        return true;
      })
    );
  }


  showCreatePost(){
      this.hidecreatepost.next(false);
  }


  viewProfilePosts( userId?: string) : Observable<any> {
    return this.http.get( this.baseURL+'posts.json' ).pipe(
      map( (data: any) => {
        console.log(data);
        
        let posts: PostHover[] = [];
        Object.keys(data).forEach( key => {
          let temp: PostHover = {
            postId: key,
            link: data[key].url,
            likeCount: data[key].likes,
            commentCount: data[key].comments
          }
          if( userId) {
            if(userId === data[key].userId) {
              posts.push(temp);
            }
          } else {
            posts.push(temp);
          }
        });
        return posts;
      })
    );
  }

  getAllPosts():Observable<any>{

      return this.http.get( this.baseURL+'posts.json' ).pipe(
        map( (data: any) => {
          console.log(data);
          
          let posts: PostHover[] = [];
          Object.keys(data).forEach( key => {
            let temp: PostHover = {
              postId: key,
              link: data[key].url,
              likeCount: data[key].likes,
              commentCount: data[key].comments
            }
              posts.push(temp);
          });
          return posts;
        })
      );
    
  }


  getPostLikes(postId: string): Observable<any> {
    return this.http.get(`${this.baseURL}likes.json`).pipe(
      map((data: any) => {
        if(data) {
          let likes: Like[] = [];
          Object.keys(data).forEach( key => {

            if( postId === data[key].postId ) {
              let temp: Like = {
                likeId: key,
                postId: data[key].postId,
                userId: data[key].userId,
                timeStamp: data[key].timeStamp
              }
              likes.push(temp);
            }
          })
          return likes;
      } else{
        return [];
      }
      })
    );
  }

  userIsLiked( userId: string, postId: string): Observable<any> {
    return this.getPostLikes(postId).pipe(
      map((likes: Like[] ) => {
        return likes.find( (like: Like) => like.userId === userId);
        
      })
    );
  }


  showPost(postId: string){
    this.viewpost.next(false);

    this.http.get<Post[]>("assets/static-data/posts.json").subscribe(data => {    
        this.postURL.next(data.find(post => post.postId === postId)?.url!);
      })
  }

  viewPost(postId:string){
    this.viewpost.next(false);
    console.log(postId);
    
    this.postid.next(postId);
  }  

    isImage(url: string) {
      url = url.split('?')[0];
      return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
    }


    homeProfilePosts( userId: string) : Observable<any> {
      return this.http.get( this.baseURL+'posts.json' ).pipe(
        map( (data: any) => {          
          let posts: Post[] = [];
          Object.keys(data).forEach( key => {
            let temp: Post = {
              postId: key,
              userId: data[key].userId,
              url: data[key].url,
              caption: data[key].caption,
              timeStamp: data[key].timeStamp,
              likes: data[key].likes,
              comments: data[key].comments
            }
            if(userId !== data[key].userId) {
                posts.push(temp);
            }
          });
          return posts;
        })
      );
      }


  }

  
