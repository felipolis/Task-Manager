import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { List } from 'src/app/models/list.mode';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(
    private taskService: TaskService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  createList(title: string) {
    // We want to send a request to create a list
    this.taskService.createList(title).subscribe((task: List) => {
      console.log(task);
      // now we navigate to /lists/response._id
      this.router.navigate(['/lists', task._id]);
    });
  }

}
