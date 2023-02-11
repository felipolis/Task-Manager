import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
  }

  createList(title: string) {
    // We want to send a request to create a list
    this.taskService.createList(title).subscribe((response: any) => {
      console.log(response);
      // now we navigate to /lists/response._id
    });
  }

}
