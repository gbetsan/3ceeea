# Written Evaluation

Lastly, please provide a markdown file with the answers to the following questions below.  

The product team has decided that we want to make a change to this application such that authors of a blog post can have different roles:  

- Authors can be owners, editors, or viewers of a blog post. For any blog post, there must always be at least one owner of the blog post. Only owners of a blog post can modify the authors' list to a blog post (adding more authors, changing their role).  

## Notes:
- It is possible to refactor and restructure this project to better meet given criteria, however sometimes it is also a matter of the system design: return on over-engineering is minimal if the project is small and it is known that it won't be extended in the future.
- Possible improvements:
    1. Error Handling Structure (without try/catch )
    2. Better use of middleware
    3. Following design patterns: better use of controller helper functions
    4. Optimizing function comments for JSDoc/Doxygen
- Other improvements are noted in corresponding TODOs for each function.
- Please also note that I haven't worked that much with backend on Express/Node, so I am pretty sure there are certain things that can be done better. 

## Questions:
1. What database changes would be required to the starter code to allow for different roles for authors of a blog post? Imagine that we’d want to also be able to add custom roles and change the permission sets for certain roles on the fly without any code changes.    
    * To implement roles and permissions into the current system, the best solution would be to create a new Role table which will store a set number of roles along with permissions and implement a relationship of UserPost has one Role. It will allow to know what Role User has on a particular Post and customize Roles on the fly to meet product team requirements * 
2. How would you have to change the PATCH route given your answer above to handle roles?
    * I wouldn't change the PATCH route itself but change its behaviour to introduce new authorization features instead. * 

## Considerations
- [x] Please format your answers so that they are easy to digest, and do not include any code in your pull request related to these questions above. We will be evaluating both the quality of your answer as well as the quality of your written explanation of that answer.
- [x] Please include a file in the root of the repo called roles-proposal.md that addresses these questions.
