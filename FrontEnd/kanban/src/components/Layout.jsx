import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx"
import { Footer } from "./Footer.jsx";

export default function Layout(){
    return(
        <>
            <Header/>
            <main>
                <Outlet/>
            </main>
            <Footer/>
        </>

    )
}