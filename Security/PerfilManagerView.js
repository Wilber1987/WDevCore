
import { Tbl_Profile } from '../../ModelProyect/ProyectDataBaseModel.js';
import { PerfilManagerComponent } from './PerfilManagerComponent.js';

const OnLoad = async () => {
    const Dataset = await new Tbl_Profile().Get();
    const ProfilesComp = new PerfilManagerComponent(Dataset);
    Main.appendChild(ProfilesComp);
}
window.onload = OnLoad;