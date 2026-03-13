import React from "react";
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";

import Home from "./pages/Home";
import CategoryVideos from "./pages/CategoryVideos";
import VideoPlayer from "./pages/VideoPlayer";
import AdminDashboard from "./pages/AdminDashboard";
import UploadPodcast from "./pages/UploadPodcast";

function App(){

return(

<Router>

<Routes>

<Route path="/" element={<Home/>}/>
<Route path="/category/:slug" element={<CategoryVideos/>}/>
<Route path="/video/:id" element={<VideoPlayer/>}/>

<Route path="/admin" element={<AdminDashboard/>}/>
<Route path="/admin/upload" element={<UploadPodcast/>}/>

</Routes>

</Router>

)

}

export default App;