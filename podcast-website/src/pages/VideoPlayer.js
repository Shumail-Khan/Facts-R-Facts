import React from "react";
import {useParams} from "react-router-dom";

function VideoPlayer(){

const {id} = useParams();

return(
<div>

<iframe
width="800"
height="450"
src={`https://www.youtube.com/embed/${id}`}
title="Podcast"
allowFullScreen
></iframe>

</div>
)
}

export default VideoPlayer;