import styles from './NavComponent.module.css'

export type ProfilePictureProps = {
  title: string
  picture: string
}

export const ProfilePicture = (props: ProfilePictureProps) => (
  <img
    class={`${styles['profile-picture']} ${styles.tiny}`}
    src={props.picture}
    title={props.title}
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
    alt="profile"
  />
)
