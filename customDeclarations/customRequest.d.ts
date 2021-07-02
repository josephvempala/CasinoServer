declare global{
    namespace Express{
        export interface User {
            admin? : boolean;
            _id?: number;
        }
    }
}
 