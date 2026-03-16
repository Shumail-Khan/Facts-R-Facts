import React from "react";
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";

import Home from "./pages/Home";
import CategoryVideos from "./pages/CategoryVideos";
import VideoPlayer from "./pages/VideoPlayer";
import AdminDashboard from "./pages/AdminDashboard";
import UploadPodcast from "./pages/UploadPodcast";
import AdminLogin from "./pages/AdminLogin";
import AdminCategories from "./pages/AdminCategories";
import AdminVideos from "./pages/AdminVideos";
import AdminEditVideo from "./pages/AdminEditVideo";


function App(){

return(

<Router>

<Routes>

<Route path="/" element={<Home/>}/>
<Route path="/category/:slug" element={<CategoryVideos/>}/>
<Route path="/video/:id" element={<VideoPlayer/>}/>
<Route path="/admin/login" element={<AdminLogin />} /> {/* NEW LOGIN ROUTE */}
<Route path="/admin" element={<AdminDashboard/>}/>
<Route path="/admin/upload" element={<UploadPodcast/>}/>
<Route path="/admin/categories" element={<AdminCategories />} />
<Route path="/admin/videos" element={<AdminVideos/>} />
<Route path="/admin/edit/:id" element={<AdminEditVideo/>} />

</Routes>

</Router>

)

}

export default App;