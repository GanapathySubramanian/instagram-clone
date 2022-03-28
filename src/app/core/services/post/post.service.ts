import { Injectable } from '@angular/core';
import {PostForm} from "../../interfaces/post/post-form";
import {HttpClient} from "@angular/common/http";
import {FileUploadService} from "../media/file-upload.service";
import {Observable} from "rxjs";
import { Comment } from "../../interfaces/react/comment";
import {finalize} from "rxjs/operators";
import {Like} from "../../interfaces/react/like";

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private baseURL: string = 'https://instagram-clone-ui-1f83e-default-rtdb.firebaseio.com/'

  constructor( private http: HttpClient) { }

  createPost( post: PostForm): Observable<any> {
    return this.http.post(this.baseURL + 'posts.json', post);
  }

  commentPost( comment: Comment): Observable<any> {
    return this.http.post(  this.baseURL + 'comments.json', comment);
  }

  likePost( like: Like): Observable<any> {
    return this.http.post( this.baseURL + 'likes.json', like);
  }

  unlikePost( unlike: Like): Observable<any> {
    return this.http.delete( `${this.baseURL}likes/${unlike.likeId}`);
  }



}
