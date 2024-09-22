<?php

    $inData = getRequestInfo();
    
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];
    $contactID = $inData["contactID"];
    $firstname = $inData["firstname"];
    $lastname = $inData["lastname"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");     
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {

        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
           returnWithError("Invalid email format");
           exit();
        }

        $formattedPhone = validating($phone);

        if(!$formattedPhone){
            returnWithError("Invalid Phone number format");
            exit();
         }

        // Updates contact information based on contact ID and user ID
        $stmt = $conn->prepare("UPDATE Contacts SET FirstName = ? , LastName = ? , Phone = ?, Email = ? WHERE ID = ? AND UserID = ?");
        $stmt->bind_param("ssssii", $firstname , $lastname , $formattedPhone, $email, $contactID, $userID);

        if($stmt->execute())
        {
            if($stmt->affected_rows > 0)
            {
                returnWithInfo("Contact updated successfully.");
            }
            else
            {
                returnWithError("No changes made. Please make a change or select Cancel");
            }
        }
        else
        {
            returnWithError("Error updating contact: " . $stmt->error);
        }

        $stmt->close();
        $conn->close();
    }

    function validating($phone){

        $result = null;

        $filter = preg_replace('/\D/', '', $phone);

        if(preg_match('/^(\d{3})(\d{3})(\d{4})$/', $filter, $matches)){
            $result = $matches[1] . '-' . $matches[2] . '-' . $matches[3];
        }

        return $result;

    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }
    
    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    function returnWithInfo( $info )
    {
        $retValue = '{"result":"' . $info .'","error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
